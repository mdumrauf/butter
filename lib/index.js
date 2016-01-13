
const _ = require('lodash');
const androidParser = require('./android-parser');

const Butter = {

  keywords: {},
  languages: [],

  keys: () => _.keys(Butter.keywords),

  load: (dirPath) => {
    return androidParser.parse(dirPath)
      .then(_.partial(_.merge, Butter))
      .thenReturn(Butter);
  },

  toCsv: () => {
    var translations = [];
    var csv = `Key,${Butter.languages.join()}\n`;
    _.forEach(Butter.keys(), (key) => {
      _.forEach(Butter.languages, (lang) => {
        translations.push(Butter.keywords[key][lang] || '');
      });
      csv += `${key},${translations.join()}\n`;
      translations = [];
    });
    return csv;
  }

};

module.exports = Butter;
