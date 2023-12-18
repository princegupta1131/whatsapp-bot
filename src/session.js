const session = require('express-session');

const inMemoryStore = {};
var isLangSelection, isBotSelection;

// const PROPERTIES = {
//   ""
// }


const init = () => {
  return session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
   // cookie: { secure: true, sameSite: true, maxAge: 60000 }
});
  
  console.log("Session init called.");
}

const createSession = (id, key, value) => {
  // inMemoryStore[id]
}

const setUserLanguage = (req, msg) => {
    let langKey = msg?.interactive?.button_reply?.id && msg?.interactive?.button_reply?.id.includes('lang') && msg?.interactive?.button_reply?.id?.split('__')[1]
    console.log('User selected Language: ',langKey)

    if (langKey) {
        // If not present, set the default value from the incoming message
       // let langKey = msg?.interactive?.button_reply?.id.split('_')[1]
        // languageSelection = id;
        isLangSelection = langKey;
        req.session.languageSelection = isLangSelection;
        
       let memUserSes = getSession(req, msg);
        memUserSes.languageSelection = isLangSelection;
        Object.assign(inMemoryStore, memUserSes);
      console.log("=== setSession: ", memUserSes);
      
        console.log('Session - User selected lang: ', isLangSelection);
        console.log('req session', req.session);
    } else {
        console.log('XX Session lang does not exist.');
        // if (id && languageSelection !== id && id.includes('lan')) {
        //     req.session.languageSelection = id;
        //     console.log('Updated languageSelection:', id);
        // }
    }
    return isLangSelection;
}

const getUserLanguage = (req, msg) => {
  let lang = req?.session?.languageSelection || getSession(req, msg).languageSelection;
  // if(!lang) lang = 'en';  // default lang "en"
  return lang;
} 

const setUserBot = (req, msg) => {
  let botId = msg?.interactive?.button_reply?.id && msg?.interactive?.button_reply?.id.includes('bot') && msg?.interactive?.button_reply?.id?.split('__')[1]
   if (botId) {
        // If not present, set the default value from the incoming message
        // userSelection = id;
       isBotSelection = botId;
        req.session.userSelection = botId;
     
       
        var memUserSes = getSession(req, msg);
        memUserSes.userSelection = botId;
        Object.assign(inMemoryStore, memUserSes);
        console.log("=== setSession: ", memUserSes);
       
        console.log('Session - User selected bot: ', botId);
        console.log('req session', req.session);
    } else {
        console.log('XX Session user bot section does not exist.');
        // if (id && userSelection !== id) {
        //     req.session.userSelection = id;
        //     console.log('Updated userSelection:', id);
        // }
    }
  return isBotSelection
} 

const getUserBot = (req, msg) => {
  return req?.session?.userSelection || getSession(req, msg).userSelection;
} 

const getAudience = (req) => {
  return "any";
}

const getSession = (req, msg) => {
  var userSesKey = 'user'+ (msg?.context?.from || msg?.context?.display_phone_number);
  let userSes = inMemoryStore[userSesKey];
  if(!userSes) {
    
    userSes = {};
    userSes[userSesKey] = {}
    Object.assign(inMemoryStore, userSes);
    console.log("XXX getSession:", userSes);
  }
  
  console.log("=== getSession: ", inMemoryStore);
  return userSes;
}

module.exports = {init, getUserLanguage, setUserLanguage, setUserBot, getUserBot  }