
const
  fs = require('fs'),
  path = require('path');
const
  Bluebird = require('bluebird'),
  _ = require('lodash'),
  xml2js = require('xml2js');

Bluebird.promisifyAll(fs);
Bluebird.promisifyAll(path);
Bluebird.promisifyAll(xml2js);

const parser = new xml2js.Parser({
  mergeAttrs: true,
  explicitArray: false,
  charkey: 'value'
});

Bluebird.promisifyAll(parser);


const _parseValues = (xmlString) => {
  return parser.parseStringAsync(xmlString)
    .get('resources')
    .get('string')
    .then((elem) => !_.isArray(elem) ? [elem] : elem)
    .then(_.compact)
    .map((elem) => [elem.name, elem.value])
    .then(_.zipObject);
};


const AndroidStrategy = {

  parse: (dirPath) => {
    const data = {
      keywords: {},
      languages: []
    };
    return fs.readdirAsync(dirPath)
      .filter((fileName) => {
        return fs.statAsync(`${dirPath}/${fileName}`)
          .then((stat) => stat.isDirectory() && _.startsWith(fileName, 'values'))
          .catch(() => false);
      })
      .map((fileName) => {
        return fs.readFileAsync(`${dirPath}/${fileName}/strings.xml`)
          .then(_parseValues)
          .then((values) => {
            const language = _.chain(fileName).trimLeft('values').rest().value().join('') || 'default';
            data.languages.push(language);

            return _.forEach(values, (value, name) => {
              data.keywords[name] = data.keywords[name] || {};
              data.keywords[name][language] = value;
            });
          })
          .catch(_.noop);
      })
      .thenReturn(data);
  }

};

module.exports = AndroidStrategy;
