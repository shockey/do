// Target loader

import fs from 'fs'
import path from 'path'
import chai from 'chai'

var targets = {};

fs.readdirSync(path.join(__dirname)).forEach(function(file) {
  if(file === 'index.js') {
    return;
  }
  try {
    var target = require("./" + file);
    chai.expect(target).to.be.a('object');
    chai.expect(target).to.have.all.keys(['verbs', 'name', 'description', 'workingDir'])
    chai.expect(target.verbs).to.be.a('array');

  } catch(e) {
    console.log(`Oops! There was a problem parsing targets/${file}: \n'${e}'`);
    console.log('Exiting.')
    process.exit();
  }

  targets[target.name] = target;
});

module.exports = targets;
