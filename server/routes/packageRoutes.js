const express = require("express");
const router = express.Router();
const packageController = require("../controllers/packageController");

// Get all packages
router.get("/", packageController.getAllPackages);

// Get a package by ID
router.get("/:id", packageController.getPackageById);

// Create a new package
router.post("/", packageController.createPackage);

// Update a package
router.put("/:id", packageController.updatePackage);

// Delete a package
router.delete("/:id", packageController.deletePackage);

module.exports = router;
