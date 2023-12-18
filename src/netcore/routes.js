const express = require('express');
const router = express.Router();

const service = require("./service");

console.log("netcore routes..");
router.post('/webhook', service.webhook);
router.get('/test', service.test);

module.exports = router;