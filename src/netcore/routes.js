const express = require('express');
const router = express.Router();
const service = require("./service");

router.post('/webhook', service.webhook);
router.get('/test', service.test);

module.exports = router;