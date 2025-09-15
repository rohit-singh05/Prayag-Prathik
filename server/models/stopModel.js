const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], 
            required: true,
            index: '2dsphere'
        }
    },
    type: {
        type: String,
        enum: ['bus', 'auto', 'tourist_spot'],
        required: true
    },
    time: {
        monday: { type: String, required: true },
        tuesday: { type: String, required: true },
        wednesday: { type: String, required: true },
        thursday: { type: String, required: true },
        friday: { type: String, required: true },
        saturday: { type: String, required: true },
        sunday: { type: String, required: true }
    },
    image: {
        type: String,
        required: false
    },
    description: {
        type: String, 
        required: false
    }
});

const Stop = mongoose.model('Stop', stopSchema);
module.exports = Stop;
