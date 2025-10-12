const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop', required: true },
    time: { type: Number, required: true }, 
    cost: { type: Number, required: true },
    edgeType: {
        type: String,
        enum: ['bus', 'auto'],
        required: true
    }
});

const Route = mongoose.model('Route', routeSchema);
module.exports = Route;
