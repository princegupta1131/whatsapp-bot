const fs = require('fs');
const glob = require( 'glob' );

var language_dict = {};

const init = () => {
    glob.sync( 'assets/language/*.json' ).forEach( function( file ) {
        let dash = file.split("/");
        if(dash.length == 3) {
            let dot = dash[2].split(".");
          if(dot.length == 2) {
            let lang = dot[0];
            fs.readFile(file, function(err, data) {
              language_dict[lang] = JSON.parse(data.toString());
            });
          }
        }
      });
}

const getLangSelection = () => {
  return language_dict['en']['lang_selection']
}

module.exports = {init, language_dict, getLangSelection}
