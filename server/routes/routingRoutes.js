const express = require('express');
const router = express.Router();
const { calculateRoute, getAllTouristSpots, getAllSpots, getSpotInfo } = require('../controllers/routingController');

router.post('/calculate', calculateRoute);
router.get("/tourist-spots", getAllTouristSpots);
router.get("/all-spots", getAllSpots);
router.get("/spot/:id", getSpotInfo);

module.exports = router;