const express = require('express');
const router = express.Router();
const { translate } = require('../controllers/translationController');

router.get('/translate', translate);

module.exports = router;
