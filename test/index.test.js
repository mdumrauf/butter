/* globals describe, it, before */

const
 fs = require('fs'),
 path = require('path');

require('should');
const
  Bluebird = require('bluebird'),
  _ = require('lodash');

const Butter = require('../lib');

Bluebird.promisifyAll(fs);


const _testStrategy = (strategy, defaultLang) => {

  describe(`#${strategy}`, () => {

    before(() => Butter.load(strategy, path.resolve(__dirname, `data-${strategy}`)));

    describe('#init', () => {

      it('should have 4 keys loaded', () => {

        const keys = Butter.keys();
        keys.length.should.be.eql(4);
        keys.should.be.eql(['LOGIN_TEXT_LOGIN', 'LOGIN_TEXT_PASSWORD', 'LOGIN_FIRSTNAME', 'LOGIN_BIRTHDAY']);

      });

      it(`should have ${defaultLang}, es and pt translations for LOGIN_FIRSTNAME, no it`, () => {

        Butter.keywords.should.have.propertyByPath('LOGIN_FIRSTNAME', defaultLang).eql('First Name');
        Butter.keywords.should.have.propertyByPath('LOGIN_FIRSTNAME', 'es').eql('Nombre');
        Butter.keywords.should.have.propertyByPath('LOGIN_FIRSTNAME', 'pt').eql('Nome Próprio');
        Butter.keywords.should.not.have.propertyByPath('LOGIN_FIRSTNAME', 'it');

      });

      it(`should have ${defaultLang} translation for LOGIN_TEXT_LOGIN only`, () => {

        Butter.keywords.should.have.propertyByPath('LOGIN_TEXT_LOGIN', defaultLang).eql('Login');
        Butter.keywords.should.not.have.propertyByPath('LOGIN_TEXT_LOGIN', 'es');
        Butter.keywords.should.not.have.propertyByPath('LOGIN_TEXT_LOGIN', 'pt');
        Butter.keywords.should.not.have.propertyByPath('LOGIN_TEXT_LOGIN', 'it');

      });

      it(`should have ${defaultLang} translation for LOGIN_TEXT_PASSWORD only`, () => {

        Butter.keywords.should.have.propertyByPath('LOGIN_TEXT_PASSWORD', defaultLang).eql('Password');
        Butter.keywords.should.not.have.propertyByPath('LOGIN_TEXT_PASSWORD', 'es');
        Butter.keywords.should.not.have.propertyByPath('LOGIN_TEXT_PASSWORD', 'pt');
        Butter.keywords.should.not.have.propertyByPath('LOGIN_TEXT_PASSWORD', 'it');

      });

      it('should have es translation for LOGIN_BIRTHDAY only', () => {

        Butter.keywords.should.not.have.propertyByPath('LOGIN_BIRTHDAY', defaultLang);
        Butter.keywords.should.have.propertyByPath('LOGIN_BIRTHDAY', 'es').eql('Cumpleaños');
        Butter.keywords.should.not.have.propertyByPath('LOGIN_BIRTHDAY', 'pt');
        Butter.keywords.should.not.have.propertyByPath('LOGIN_BIRTHDAY', 'it');

      });

    });

    describe('#output', () => {

      it('should output the expected csv', (done) => {

        Bluebird.all([
          fs.readFileAsync(path.resolve(__dirname, `data-${strategy}`, 'output.csv'), { encoding: 'UTF-8' }),
          Butter.toCsv()
        ])
        .spread((e1, e2) => _.isEqual(e1, e2))
        .then((result) => {
          result.should.be.eql(true);
        })
        .then(done, done);

      });

    });
  });
};


describe('butter', () => {

  _testStrategy('android', 'default');
  _testStrategy('ios', 'en');

});
