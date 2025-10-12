const axios = require('axios');
const Translation = require('../models/translationModel');

const translate = async (req, res) => {
    const { q, targetLang } = req.query;

    if (!q || !targetLang) {
        return res.status(400).json({ error: "Missing parameters" });
    }

    try {
        let entry = await Translation.findOne({ text: q, targetLang });

        if (entry) {
            return res.json({ translatedText: entry.translatedText });
        }

        const response = await axios.get("https://api.mymemory.translated.net/get", {
            params: { q, langpair: `en|${targetLang}` },
        });

        const translated = response.data.responseData.translatedText;

        entry = new Translation({
            text: q,
            targetLang,
            translatedText: translated,
        });

        await entry.save();

        return res.json({ translatedText: translated });

    } catch (error) {
        console.error("Error translating:", error);
        res.status(500).json({ error: "Translation service failed" });
    }
};

module.exports = {
    translate
};
