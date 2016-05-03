'use strict';

// Main entry point

var _ = require('lodash');
var slackbot = require('./components/slackbot');
var targets = require('./targets');
var os = require('os');
var verbRunner = require('./components/utils/verb-runner');


slackbot.on('input', bundle => {
  if(handlers[bundle.cmd[1]]) {
    handlers[bundle.cmd[1]](bundle);
  } else if (simpleCommands[bundle.cmd[0]]) {
    simpleCommands[bundle.cmd[0]](bundle);
  } else {
    slackbot.send({
      channel: bundle.msg.channel,
      text: `something isn't right... can you double-check your request? :simple_smile:`
    })
  }
});

var simpleCommands = {
  hello(bundle) {
    slackbot.send({
      channel: bundle.msg.channel,
      text: `hi! i'm running on ${os.hostname()} :simple_smile:`
    })
  },
  help(bundle) {
    slackbot.send({
      channel: bundle.msg.channel,
      text: `_[insert help text here]_`
    })
  },
  list(bundle) {
    var verbList = '';
    for (var k in targets) {
      if (targets.hasOwnProperty(k)) {
        var target = targets[k];
        verbList +=  `${target.name} (${target.description}): ${target.verbs.map(v => `\`${v.name}\``).join(', ')}\n`;
      }
    }

    slackbot.send({
      channel: bundle.msg.channel,
      text: verbList
    })
  }
};

var handlers = {};

for (var k in targets) {
  if (targets.hasOwnProperty(k)) {
    let target = targets[k];
    // Register handlers for targets
    handlers[k] = function(bundle) {
      let verb = bundle.cmd[0];
      let verbRef = _.find(target.verbs, ['name', verb]);
      if(verbRef) {
        // if we found a valid verb on the target
        verbRunner.run(slackbot, bundle, verbRef, target);
      } else if(verb) {
        // invalid verb
        slackbot.send({
          channel: bundle.msg.channel,
          text: `oops- \`${k}\` doesn't have a verb called \`${verb}\`.`
        })
      } else {
        // nothing was specified
        slackbot.send({
          channel: bundle.msg.channel,
          text: `oops- you didn't specify a verb.`
        })
      }
    }
  }
}


///
