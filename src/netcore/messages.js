const language = require("../language");
const userSession = require("../session");
// const utils = require('./utils');
const axios = require("axios");
const botMessage = require('../botMessage');

const NETCORE_TOKEN = process.env.NETCORE_TOKEN;

/**
 * First message to the user
 * Welcome messsage along with Language selection
 * @param {*} incomingMsg 
 */
const sendLangSelection = (incomingMsg) => {
    let langSelecBody = language.getLangSelection();
    sendMessage(langSelecBody, incomingMsg);
}

/**
 * Send bot selction options to the user 
 * In the user selected language
 * @param {*} req 
 * @param {*} msg 
 */
const sendBotSelection = (req, msg) => {
    console.log("⭆ sendBotSelection"); 
    let body = botMessage.getBotSelection(userSession.getUserLanguage(req, msg));
    sendMessage(body, msg);
}

/**
 * Send welcome message for the selected bot 
 * In the user selected language
 * @param {*} req 
 * @param {*} msg 
 */
const sendBotWelcomeMsg = (req, msg) => {
    console.log("⭆ sendBotWelcomeMsg"); 
    let userLang = userSession.getUserLanguage(req, msg);
    let userBot = userSession.getUserBot(req, msg);
    let body = botMessage.getBotMessage(userLang, userBot, 'hi');
    sendMessage(body, msg);
}

/**
 * Send Bot response for the user query
 * @param {*} req 
 * @param {*} msg 
 */
const sendBotResponse = async (req, msg) => {
    console.log("⭆ sendBotResponse"); 
    let userLang = userSession.getUserLanguage(req, msg);
    let userBot = userSession.getUserBot(req, msg);

    await sendBotLoadingMsg(req, msg, userLang, userBot);
    await sendBotReplyFooter(req, msg, userLang, userBot);
}

/**
 * Loading message while getting the response from the Bot
 * @param {*} userLang 
 * @param {*} userBot 
 */
const sendBotLoadingMsg = async(req, msg, userLang, userBot) => {
    let body = botMessage.getBotMessage(userLang, null, 'loading_message');
    await sendMessage(body, msg);
}

/**
 * Footer options for Bot response message
 * "*" to go main menu & "#" to go language selection
 * @param {*} userLang 
 * @param {*} userBot 
 */
const sendBotReplyFooter = async(req, msg, userLang, userBot) => {
    let body = botMessage.getBotMessage(userLang, null, 'footer_message');
    await sendMessage(body, msg);
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

    return body;
}

module.exports = { sendLangSelection, sendBotSelection, sendBotWelcomeMsg, sendMessage, sendBotResponse }