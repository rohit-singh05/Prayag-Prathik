const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        locations: [
            {
                type: String,
                required: true,
            },
        ],
        recommendedMonths: {
            type: [Number],
            default: [],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Package", packageSchema);
