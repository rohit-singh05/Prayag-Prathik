const Package = require("../models/packageModel");

// Get all packages
exports.getAllPackages = async (req, res) => {
    try {
        const packages = await Package.find();
        res.status(200).json({ packages });
    } catch (err) {
        console.error("Error fetching packages:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Get a single package by ID
exports.getPackageById = async (req, res) => {
    try {
        const pkg = await Package.findById(req.params.id);
        if (!pkg) return res.status(404).json({ message: "Package not found" });
        res.status(200).json(pkg);
    } catch (err) {
        console.error("Error fetching package:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Create a new package
exports.createPackage = async (req, res) => {
    try {
        const { title, description, image, locations } = req.body;
        const newPackage = new Package({ title, description, image, locations });
        await newPackage.save();
        res.status(201).json(newPackage);
    } catch (err) {
        console.error("Error creating package:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Update a package by ID
exports.updatePackage = async (req, res) => {
    try {
        const { title, description, image, locations } = req.body;
        const updatedPackage = await Package.findByIdAndUpdate(
            req.params.id,
            { title, description, image, locations },
            { new: true }
        );
        if (!updatedPackage) return res.status(404).json({ message: "Package not found" });
        res.status(200).json(updatedPackage);
    } catch (err) {
        console.error("Error updating package:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete a package by ID
exports.deletePackage = async (req, res) => {
    try {
        const deletedPackage = await Package.findByIdAndDelete(req.params.id);
        if (!deletedPackage) return res.status(404).json({ message: "Package not found" });
        res.status(200).json({ message: "Package deleted successfully" });
    } catch (err) {
        console.error("Error deleting package:", err);
        res.status(500).json({ message: "Server error" });
    }
};
