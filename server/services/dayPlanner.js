const Stop = require("../models/stopModel");
const Route = require("../models/routeModel");

const explorationTimes = {
    "Anand Bhavan": 90,
    "Triveni Sangam": 60,
    "Allahabad Fort": 120,
    "Khusro Bagh": 60,
    default: 60
};

function parseTimeToMinutes(timeStr) {
    const [time, modifier] = timeStr.trim().split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier?.toLowerCase() === "pm" && hours !== 12) hours += 12;
    if (modifier?.toLowerCase() === "am" && hours === 12) hours = 0;

    return hours * 60 + (minutes || 0);
}

function getDayTimings(stop, date) {
    const days = [
        "sunday", "monday", "tuesday", "wednesday",
        "thursday", "friday", "saturday"
    ];
    const dayName = days[date.getDay()];
    const timingsStr = stop.time?.[dayName];

    if (!timingsStr) return [];

    if (timingsStr.toLowerCase().includes("open 24 hours")) {
        return [{ open: "12:00 AM", close: "11:59 PM" }];
    }

    return timingsStr.split(",").map(range => {
        const [open, close] = range.trim().split(" - ");
        return { open: open.trim(), close: close.trim() };
    });
}

function isWithinOpenHours(arrivalMinutes, timings) {
    for (const { open, close } of timings) {
        const openMinutes = parseTimeToMinutes(open);
        const closeMinutes = parseTimeToMinutes(close);
        if (arrivalMinutes >= openMinutes && arrivalMinutes < closeMinutes) {
            return true;
        }
    }
    return false;
}

async function buildGraph() {
    const routes = await Route.find().populate("from to");
    const graph = {};
    for (const r of routes) {
        const fromId = r.from._id.toString();
        const toId = r.to._id.toString();

        if (!graph[fromId]) graph[fromId] = [];
        graph[fromId].push({
            to: toId,
            time: r.time,
            cost: r.cost,
            edgeType: r.edgeType
        });
    }
    return graph;
}

function dijkstra(graph, startId) {
    const distances = {};
    const visited = {};
    const previous = {};

    for (const node in graph) {
        distances[node] = Infinity;
        previous[node] = null;
    }
    distances[startId] = 0;

    while (true) {
        let closest = null;
        let closestDist = Infinity;

        for (const node in distances) {
            if (!visited[node] && distances[node] < closestDist) {
                closest = node;
                closestDist = distances[node];
            }
        }

        if (closest === null) break;
        visited[closest] = true;

        for (const edge of graph[closest]) {
            const neighbor = edge.to;
            const newDist = distances[closest] + edge.time + edge.cost;

            if (newDist < distances[neighbor]) {
                distances[neighbor] = newDist;
                previous[neighbor] = closest;
            }
        }
    }

    return { distances, previous };
}

async function planDay(startStopId, destinationIds, startTime = "10:00 AM") {
    const graph = await buildGraph();
    const stops = await Stop.find({ _id: { $in: [startStopId, ...destinationIds] } });

    const stopMap = stops.reduce((acc, s) => {
        acc[s._id.toString()] = s;
        return acc;
    }, {});

    let current = startStopId.toString();
    let currentTime = parseTimeToMinutes(startTime);
    const currDate = new Date();
    currDate.setHours(Math.floor(currentTime / 60), currentTime % 60, 0, 0);

    const remaining = new Set(destinationIds.map(id => id.toString()));
    const plan = [];
    let totalCost = 0;
    let day = 1;
    let safetyCounter = 0;
    const maxIterations = destinationIds.length * 5;

    while (remaining.size > 0 && safetyCounter < maxIterations) {
        safetyCounter++;

        const { distances, previous } = dijkstra(graph, current);

        let nextStop = null;
        let bestDist = Infinity;
        let bestPath = null;
        let bestEdge = null;

        for (const candidate of remaining) {
            const candidateStop = stopMap[candidate];
            if (!candidateStop || distances[candidate] === Infinity) continue;

            const arrivalTime = currentTime + getEdgeTime(graph, current, candidate);
            const timings = getDayTimings(candidateStop, currDate);

            if (!isWithinOpenHours(arrivalTime, timings)) continue;

            if (distances[candidate] < bestDist) {
                bestDist = distances[candidate];
                nextStop = candidate;
                bestPath = reconstructPath(previous, current, candidate);
                bestEdge = getEdge(graph, current, candidate);
            }
        }

        if (!nextStop) {
            day++;
            currentTime = parseTimeToMinutes("10:00 AM");
            currDate.setDate(currDate.getDate() + 1);
            currDate.setHours(10, 0, 0, 0);
            continue;
        }

        const stop = stopMap[nextStop];
        const exploreTime = explorationTimes[stop.name] || explorationTimes.default;
        const arrivalTime = currentTime + bestEdge.time;
        const leaveTime = arrivalTime + exploreTime;

        const timings = getDayTimings(stop, currDate);
        const fitsToday = timings.some(({ close }) => leaveTime <= parseTimeToMinutes(close));

        if (!fitsToday) {
            day++;
            currentTime = parseTimeToMinutes("10:00 AM");
            currDate.setDate(currDate.getDate() + 1);
            currDate.setHours(10, 0, 0, 0);
            continue;
        }

        const arrivalDate = new Date(currDate);
        arrivalDate.setMinutes(arrivalDate.getMinutes() + (arrivalTime - parseTimeToMinutes(startTime)));

        const leaveDate = new Date(arrivalDate);
        leaveDate.setMinutes(leaveDate.getMinutes() + exploreTime);

        plan.push({
            travel: {
                from: stopMap[current],
                to: stop,
                mode: bestEdge.edgeType,
                time: bestEdge.time,
                cost: bestEdge.cost
            },
            visit: {
                stop: stop,
                arrival: arrivalDate.toISOString(),
                leave: leaveDate.toISOString(),
                exploreTime,
                day
            }
        });

        current = nextStop;
        currentTime = leaveTime;
        totalCost += bestEdge.cost;
        remaining.delete(nextStop);
    }

    if (safetyCounter >= maxIterations) {
        throw new Error("PlanDay exceeded maximum iterations. Possible disconnected graph.");
    }

    return { plan, totalCost, days: day };
}

function getEdgeTime(graph, fromId, toId) {
    const edges = graph[fromId] || [];
    const edge = edges.find(e => e.to === toId);
    return edge ? edge.time : Infinity;
}

function getEdge(graph, fromId, toId) {
    const edges = graph[fromId] || [];
    return edges.find(e => e.to === toId);
}

function reconstructPath(previous, startId, endId) {
    const path = [];
    let current = endId;
    while (current && current !== startId) {
        path.unshift(current);
        current = previous[current];
    }
    if (current) path.unshift(startId);
    return path;
}

module.exports = { planDay };
