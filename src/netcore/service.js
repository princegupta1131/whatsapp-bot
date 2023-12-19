const express = require("express");
const axios = require("axios");
const fs = require('fs');
const language = require("../language");
const session = require("../session");
const botFile = fs.readFileSync('assets/bots.json', 'utf-8');
// const footerFile = fs.readFileSync('assets/footer.json', 'utf-8');


// Read JSON file
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
var WHATSAPP_TO = process.env.WHATSAPP_TO;
const WHATSAPP_VERSION = process.env.WHATSAPP_VERSION;
const WHATSAPP_PHONEID = process.env.WHATSAPP_PHONEID;
const CHAR_LIMIT = process.env.CHAR_LIMIT;
const NETCORE_TOKEN = process.env.NETCORE_TOKEN;

const bots = JSON.parse(botFile);
// const footer = JSON.parse(footerFile);

var isLangSelection, isBotSelection;

const sendMessage = async (req, res, body) => {
    // console.log("SendMessage: ", body);

    // For Text convesations
    let hostUrl = "https://cpaaswa.netcorecloud.net/api/v2/message/nc";
    
    // For Interactive message conversations
    // if(body?.type.toString().toLowerCase() != "text") {
    //     hostUrl = "https://waapi.pepipost.com/api/v2/message/"
    // }

    console.log("hostUrl: ", hostUrl);
    console.log("body: ", JSON.stringify(body));

    try {
        body = setMessageTo(req, body)
        const response = await axios.post(
            hostUrl,
            body,
            {
                headers: {
                    Authorization: `Bearer ${NETCORE_TOKEN}`,
                }
            }
        );
        console.log("webhook => Sent message to WhatsApp");
        res.status(response.status).send(response.statusText);
    } catch (error) {
         console.log("webhook => error occurred with status code:", error);
        res.status(error?.response?.status).send(error?.response?.statusText);
    }
     
}

const setMessageTo = async (req, body) => {
    if(body.incoming_message) {
        body.incoming_message[0].to = req.body.incoming_message[0].from;
    } else {
        body.message[0].recipient_whatsapp = req.body.incoming_message[0].from;
    }
    console.log("setMessageTo: ", JSON.stringify(body));

    return body;
}

const webhook = async (req, res) => {
    console.log("webhook: ", req.body);
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
        res.sendStatus(200);
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

        sendMessage(req, res, body)
        // req.session.languageSelection = null
        // req.session.userSelection = null

    } 
    res.sendStatus(200);
    // if (((!userSelection && msg?.message_type !== 'interactive') || msg?.interactive_type?.button_reply.id === 'end')) {
    //     console.log('incoming', msg);
    //     let body = {
    //         "message": [
    //             {
    //                 "recipient_whatsapp": msg.recipient_whatsapp,
    //                 "message_type": "interactive",
    //                 "recipient_type": "individual",
    //                 "source": "e4aba266d56a3726c36a2053d70c989d",
    //                 "x-apiheader": "custom_data",
    //                 "type_interactive": [
    //                     {
    //                         "type": "button",
    //                         "body": "Welcome to Digital Jadui Pitara \n Please select the options below",
    //                         "action": [
    //                             {
    //                                 "buttons": [
    //                                     {
    //                                         "type": "reply",
    //                                         "reply": {
    //                                             "id": "1",
    //                                             "title": "Stories"
    //                                         }
    //                                     },
    //                                     {
    //                                         "type": "reply",
    //                                         "reply": {
    //                                             "id": "2",
    //                                             "title": "Teachers"
    //                                         }
    //                                     },
    //                                     {
    //                                         "type": "reply",
    //                                         "reply": {
    //                                             "id": "3",
    //                                             "title": "Students"
    //                                         }
    //                                     }
    //                                 ]
    //                             }
    //                         ]
    //                     }
    //                 ]
    //             }
    //         ]

    //     }

    //     axios.post(
    //         `https://waapi.pepipost.com/api/v2/message/`,
    //         body,
    //         {
    //             headers: {
    //                 Authorization: `Bearer ${NETCORE_TOKEN}`,
    //             }
    //         }).then(
    //             (response) => {
    //                 console.log("webhook => Sent initial message to WhatsApp");
    //                 res.status(response.status).send(response.statusText);
    //             },
    //             (error) => {
    //                 console.log("webhook => error occured  with status code:", error.response.status);
    //                 res.status(error.response.status).send(error.response.statusText);
    //             }
    //         );

    //     await req?.session?.destroy((err) => {
    //         if (err) {
    //             console.error('Error destroying session:', err);
    //             res.sendStatus(500);
    //         } else {
    //             console.log('Session cleared successfully');
    //         }
    //     })
    // } else {
    //     console.log('USER Selection----', userSelection)

    //     if (!userSelection) {
    //         // If not present, set the default value from the incoming message
    //         userSelection = msg.interactive_type.button_reply.id;
    //         req.session.userSelection = userSelection;
    //         console.log('Value not present. Setting userSelection:', userSelection);
    //     } else {
    //         console.log('Existing userSelection:', userSelection);
    //     }

    //     // let endMsg = "\n 0: Go to 'Main Menu' \n 1: 'Change Lang'";
    //     let botResponse = await getBotMessage(msg, userSelection);
    //     console.log("webhook => botResponse", botResponse?.answer.trim(100));
    //     let ansStr = botResponse?.answer.substring(0, `${CHAR_LIMIT}`)
    //     axios({
    //         "method": "post",
    //         "url": `https://waapi.pepipost.com/api/v2/message/`,
    //         "data": {
    //             "message": [
    //                 {
    //                     "recipient_whatsapp": WHATSAPP_TO,
    //                     "message_type": "interactive",
    //                     "recipient_type": "individual",
    //                     "source": "e4aba266d56a3726c36a2053d70c989d",
    //                     "x-apiheader": "custom_data",
    //                     "type_interactive": [
    //                         {
    //                             "type": "button",
    //                             "body": botResponse?.answer,
    //                             "action": [
    //                                 {
    //                                     "buttons": [
    //                                         {
    //                                             "type": "reply",
    //                                             "reply": {
    //                                                 "id": "end",
    //                                                 "title": "Start Again"
    //                                             }
    //                                         }
    //                                     ]
    //                                 }
    //                             ]
    //                         }
    //                     ]
    //                 }
    //             ]

    //         },
    //         headers: {
    //             "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
    //             "Content-Type": "application/json"
    //         },
    //     })
    //         .then(
    //             (response) => {
    //                 console.log("webhook => Sent message to WhatsApp");
    //                 res.status(response.status).send(response.statusText);
    //             },
    //             (error) => {
    //                 console.log("webhook => error occured  with status code:", error.response.status);
    //                 // console.log("webhook => error:");
    //                 res.status(error.response.status).send(error.response.statusText);
    //             }
    //         );
    // }
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

module.exports = { sendMessage, webhook, test }