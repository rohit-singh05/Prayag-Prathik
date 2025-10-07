const mongoose = require("mongoose")
const dotenv = require("dotenv")
const Package = require("./models/packageModel")

dotenv.config();

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected");
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Packages data
const packages = [
    {
        title: "Heritage & Monuments Tour",
        description: "Explore the historic monuments and heritage sites of Prayagraj.",
        image: "https://assets.telegraphindia.com/telegraph/2023/Apr/1682498919_khusro-bagh-3.jpg",
        locations: ["Allahabad Fort", "Anand Bhavan"],
    },
    {
        title: "Spiritual & Ghats Circuit",
        description: "Experience the divine aura at the ghats and temples of Prayagraj.",
        image: "https://upload.wikimedia.org/wikipedia/commons/3/36/Triveni_Sangam_2011.JPG",
        locations: ["Triveni Sangam", "Hanuman Temple", "Kalyani Devi Temple", "Shankar Viman Mandapam"],
    },
    {
        title: "Nature & Parks Trail",
        description: "Enjoy the peaceful parks and scenic beauty of Prayagraj.",
        image: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Chandrashekhar_Azad_Park_1.jpg",
        locations: ["Chandrashekhar Azad Park", "Minto Park", "Alopi Bagh"],
    },
    {
        title: "Cultural & Museums Tour",
        description: "Discover Prayagraj’s cultural landmarks and fascinating museums.",
        image: "https://upload.wikimedia.org/wikipedia/commons/5/52/Anand_Bhavan_Museum.jpg",
        locations: ["Allahabad Museum", "Anand Bhavan Museum", "Swaraj Bhawan"],
    },
];

// Seeder function
const seedPackages = async () => {
    try {
        await connectDB();

        // Clear existing packages
        await Package.deleteMany();
        console.log("Existing packages cleared");

        // Insert new packages
        const createdPackages = await Package.insertMany(packages);
        console.log(`Inserted ${createdPackages.length} packages`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedPackages();
