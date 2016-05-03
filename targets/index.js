// Target loader

var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;

var targets = {};

fs.readdirSync(path.join(__dirname)).forEach(function(file) {
  if(file === 'index.js') {
    return;
  }
  var target = require("./" + file);
  try {
    expect(target).to.be.a('object');
    expect(target).to.have.all.keys(['verbs', 'name', 'description', 'workingDir'])
    expect(target.verbs).to.be.a('array');
  } catch(e) {
    console.log(`Oops! There was a problem parsing targets/${file}`);
    console.log('Exiting.')
    process.exit();
  }

  targets[target.name] = target;
});

module.exports = targets;
