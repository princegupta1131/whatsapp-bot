"use strict";
const express = require("express");
const body_parser = require("body-parser");
const session = require('./session');  // Import session module
const language = require("./language");
const service = require("./service");
const netcore = require("./netcore");
const netcoreRoutes = require("./netcore/routes");
const app = express() // creates express http server

app.use(body_parser.json());
app.use(session.init());
language.init();

// Sets server port and logs message on success
let port = process.env.PORT || 3010;
app.listen(port, () => console.log("webhook is listening port:", port));

// Used for Meta developers account
app.post("/webhook", service.webhook)

app.post("/testMessage", service.testMessage);

// Used for Netcore whatsapp integration
app.use("/netcore", netcoreRoutes);

app.post("/guhshup/webhook", (req, res) => {
    res.sendStatus(200);
});

// For Health check
app.get("/health", (req, res) => {
    res.send('Bot is running');
});

app.get('/', function (req, res) {
    res.redirect('/health');
});

// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
app.get("/webhook", (req, res) => {
    /**
     * UPDATE YOUR VERIFY TOKEN
     *This will be the Verify Token value when you set up webhook
     **/
    const verify_token = process.env.VERIFY_TOKEN;
  
    // Parse params from the webhook verification request
    let mode = req.query["hub.mode"];
    let verifyToken = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];
  
    // Check if a token and mode were sent
    if (mode && verifyToken) {
      // Check the mode and token sent are correct
      if (mode === "subscribe" && verifyToken === verify_token) {
        // Respond with 200 OK and challenge token from the request
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);
      }
    }
  });
  

module.exports = { app }