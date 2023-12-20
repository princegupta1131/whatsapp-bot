const express = require("express");
const axios = require("axios");
const fs = require('fs');
const language = require("../language");
const session = require("../session");
const botFile = fs.readFileSync('assets/bots.json', 'utf-8');
const telemetryService = require('../telemetryService');
// const footerFile = fs.readFileSync('assets/footer.json', 'utf-8');

const NETCORE_TOKEN = process.env.NETCORE_TOKEN;

// Read JSON file
const bots = JSON.parse(botFile);
// const footer = JSON.parse(footerFile);

var isLangSelection, isBotSelection;

const sendMessage = async (body, incomingMsg) => {
    // console.log("SendMessage: ", body);

    // For Text convesations
    let hostUrl = 'https://cpaaswa.netcorecloud.net/api/v2/message/nc';
    
    // console.log("hostUrl: ", hostUrl);
    // console.log("body: ", JSON.stringify(body));
    body = JSON.stringify(setMessageTo(body, incomingMsg));
    
    try {

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://cpaaswa.netcorecloud.net/api/v2/message/nc',
            headers: { 
              'Authorization': `Bearer ${NETCORE_TOKEN}`, 
              'Content-Type': 'application/json'
            },
            data : body
          };
        const request = await axios.request(config);
        request
        .then((response) => {
            console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
            console.log(error);
        });
        // response
        // .then((res) => {
        //     console.log("webhook => Sent message to WhatsApp");
        //     res.sendStatus(200);
        // })
        // .catch((error)=> {
        //     if( error.response ){
        //         console.log("webhook => error occurred with status code:", error.response);
        //     }
        // })

        
        // res.sendStatus(200);
        //res.status(response.status).send(response.statusText);
    } catch (error) {
         console.log("webhook => error occurred with status code:", error.response);
        // res.sendStatus(error?.response?.status).json({"error": error?.response?.statusText} );
    }
     
}

const setMessageTo = (body, incomingMsg) => {
    if(body.incoming_message) {
        body.incoming_message[0].to = incomingMsg.from;
    } else {
        body.message[0].recipient_whatsapp = incomingMsg.from;
    }
    console.log("setMessageTo: ", JSON.stringify(body));

    return body;
}

const webhook = async (req, res) => {
    // console.log("webhook: ", req.body);
    let incomingMsg, msg, toMobile;
    incomingMsg = req.body?.incoming_message;
    

    if(!incomingMsg) {
        // For interactive message
        incomingMsg = req.body?.message;
        toMobile = {"recipient_whatsapp": msg?.recipient_whatsapp};
    } else {
        toMobile = {"to": msg?.from}
    }
    msg = incomingMsg && incomingMsg[0];
    let userSelection = await req?.session?.userSelection || null;
    console.log("IncomingMsg", JSON.stringify(msg));
    
    if(!msg){
        console.log("XXX no message", msg);
        res.sendStatus(402);
        return;
    } 

    
    if(msg?.type === 'interactive') {
        isLangSelection = session.getUserLanguage(req, msg);
        isBotSelection = session.getUserBot(req, msg);
    }
    
    console.log('req session', req.session);
    console.log("languageSelection: ", isLangSelection, ' userSelection: ', isBotSelection);
    // WHATSAPP_TO = msg?.from || msg?.recipient_whatsapp;

    if (((!isLangSelection && !isBotSelection && (msg?.message_type.toString().toLowerCase() === 'text')) || msg?.text?.body == '#')) {
        console.log("First time user");
        let body = language.getLangSelection(); //botMessage.getBotMessage('en', null, "lang_selection");
        // Object.assign(body, toMobile);//.recipient_whatsapp = WHATSAPP_TO;
        // postmanCode();
        sendMessage(body, msg)

        // req.session.languageSelection = null
        // req.session.userSelection = null
        res.sendStatus(200);
    } 
    
}

const getBotMessage = async (msg, userSelection) => {
    if (msg) {
        let userQuery = msg.text && msg.text.body ? msg.text.body : "Hi";
        let botUrl = bots[userSelection] + userQuery

        console.log('botURL', botUrl)
        try {
            const { data, status } = await axios({
                "method": "get",
                "url": botUrl
            })
            console.log("getBotMessage => Bot", botUrl, " respond sucessfully");
            return data;
        } catch (error) {
            if (error.response) {
                // The request was made, but the server responded with a status code other than 2xx
                console.error('Server Error:', error.response.status, error.response.data);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response from server:', error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error during request setup:', error.message);
            }
        }
    }
}

// For Health check
const test = (req, res) => {
    res.status(200).send('Netcore service API testing..');
};

// To test Netcore webhook
const testWebhook = (req, res) => {
    console.log("Webhook test: ", JSON.stringify(req.body));
    let result = 
      {
              "TRANSID": 15536250111702803,
              "RESPONSE": " - 2.0.0 (success)",
              "EMAIL": "test@gmail.com",
              "TIMESTAMP": 1553681625,
              "FROMADDRESS": "info@mydomain.com",
              "EVENT": "sent",
              "MSIZE": 2155,
              "X-APIHEADER": "UNIQUEID",
              "TAGS": "mytag1"
      };
  
    
     res.send(result);
  };

  module.exports = { sendMessage, webhook, test, testWebhook }