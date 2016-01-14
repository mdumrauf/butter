
const
  fs = require('fs'),
  path = require('path');
const
  Bluebird = require('bluebird'),
  _ = require('lodash'),
  properties = require('properties');

Bluebird.promisifyAll(fs);
Bluebird.promisifyAll(path);
Bluebird.promisifyAll(properties);

const options = {
  path: true,
  comments: '/',
  separators: '=',
  strict: true,
  reviver: function(key, value, section) {
    return value.replace(/^"|";$/g, '');
  }
};

const _parseValues = (dirPath) => {
  return properties.parseAsync(dirPath, options)
    .then(_)
    .call('mapKeys', (__, key) => key.replace(/"/g, ''))
    .call('value');
};

const LANGUAGE_TERMINATOR = '.lproj';


const IosStrategy = {

  parse: (dirPath) => {
    const data = {
      keywords: {},
      languages: []
    };
    return fs.readdirAsync(dirPath)
      .filter((langDirName) => {
        return fs.statAsync(`${dirPath}/${langDirName}`)
          .then((stat) => stat.isDirectory() && _.endsWith(langDirName, LANGUAGE_TERMINATOR))
          .catch(() => false);
      })
      .map((langDirName) => {
        return _parseValues(`${dirPath}/${langDirName}/Localizable.strings`)
          .then((values) => {
            const language = _.trimRight(langDirName, LANGUAGE_TERMINATOR) || 'default';
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

module.exports = IosStrategy;
