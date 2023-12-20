const language = require("../language");
const userSession = require("../session");
// const utils = require('./utils');
const axios = require("axios");
const botMessage = require('../botMessage');

const NETCORE_TOKEN = process.env.NETCORE_TOKEN;

const sendLangSelection = (incomingMsg) => {
    let langSelecBody = language.getLangSelection();
    sendMessage(langSelecBody, incomingMsg);
}

const sendBotSelection = (req, msg) => {
    console.log("⭆ sendBotSelection"); 
    let body = botMessage.getBotSelection(userSession.getUserLanguage(req, msg));
    sendMessage(body, msg);
}


const sendMessage = async (body, incomingMsg) => {
    body = JSON.stringify(setMessageTo(body, incomingMsg));
    console.log("SendMessage: ", body);
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
    } catch (error) {
        console.log("webhook => error occurred with status code:", error.response);
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

module.exports = { sendLangSelection, sendBotSelection }