const mongoose = require("mongoose");
const Package = require("./models/packageModel"); // adjust path if needed

// ✅ Use your MongoDB Atlas connection string
mongoose
    .connect("mongodb+srv://webproject:prayagprathik@prayag-prathik.la6pjbi.mongodb.net/prayag-pathik-db?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("✅ MongoDB connected successfully!"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

const packages = [
    {
        title: "Heritage & Monuments Tour",
        description: "Explore the historic monuments and heritage sites of Prayagraj.",
        image: "https://assets.telegraphindia.com/telegraph/2023/Apr/1682498919_khusro-bagh-3.jpg",
        locations: ["Allahabad Fort", "Anand Bhavan"],
        recommendedMonths: [10, 11, 0, 1, 2],
    },
    {
        title: "Spiritual & Ghats Circuit",
        description: "Experience the divine aura at the ghats and temples of Prayagraj.",
        image: "https://peopleplaces.in/wp-content/uploads/2023/01/Prayagraj-Explore-Pilgrimage-Destinations-Of-Uttar-Pradesh-1000x600.jpg",
        locations: [
            "Triveni Sangam",
            "Hanuman Temple",
            "Kalyani Devi Temple",
            "Shankar Viman Mandapam",
        ],
        recommendedMonths: [9, 10, 11, 0, 1, 2],
    },
    {
        title: "Nature & Parks Trail",
        description: "Enjoy the peaceful parks and scenic beauty of Prayagraj.",
        image: "https://prayagtourism.com/wp-content/uploads/2024/05/Alfred-park.webp",
        locations: ["Chandrashekhar Azad Park", "Minto Park", "Alopi Bagh"],
        recommendedMonths: [7, 8, 9, 10],
    },
    {
        title: "Cultural & Museums Tour",
        description: "Discover Prayagraj’s cultural landmarks and fascinating museums.",
        image: "https://tse3.mm.bing.net/th/id/OIP.PKrsxyrl16QwKL3G9ZqhPAHaE8?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3",
        locations: ["Allahabad Museum", "Anand Bhavan Museum", "Swaraj Bhawan"],
        recommendedMonths: [9, 10, 11, 0, 1, 2, 3],
    },
];

const seedDB = async () => {
    try {
        await Package.deleteMany({});
        await Package.insertMany(packages);
        console.log("🌱 Database seeded successfully with recommended months!");
    } catch (err) {
        console.error("❌ Error seeding database:", err);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();
