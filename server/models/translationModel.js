const mongoose = require('mongoose');

const TranslationSchema = new mongoose.Schema({
    text: { type: String, required: true },
    targetLang: { type: String, required: true },
    translatedText: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now }
});

TranslationSchema.index({ text: 1, targetLang: 1 }, { unique: true });

module.exports = mongoose.model('Translation', TranslationSchema);
