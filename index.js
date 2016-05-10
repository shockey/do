'use strict';

// Main entry point

var _ = require('lodash');
var slackbot = require('./components/slackbot');
var targets = require('./targets');
var os = require('os');
var verbRunner = require('./components/utils/verb-runner');
var pkg = require('./package.json')
var pm2 = require('pm2')


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
      text: `hi! i'm running Do version ${pkg.version} on ${os.hostname()} :simple_smile:`
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
  },
  pm2(bundle) {
    let pm2Action = bundle.cmd[1];
    let pm2TargetProcess = bundle.cmd[2];

    pm2.connect(function(err) {
      if (err) {
        console.error(err);
        slackbot.send({
          channel: bundle.msg.channel,
          text: `yikes! i wasn't able to hook into pm2. are you sure it's running?`
        })
      }

      if(pm2Action === 'start') {
        pm2.start({
          script: pm2TargetProcess,         // Script to be run
        }, handlerFn);
      }

      if(pm2Action === 'stop') {
        pm2.stop(pm2TargetProcess, handlerFn);
      }

      if(pm2Action === 'restart') {
        pm2.restart(pm2TargetProcess, handlerFn);
      }

      if(pm2Action === 'list') {
        pm2.list((err, list) => {
          if(err) {
            slackbot.send({
              channel: bundle.msg.channel,
              text: `bad news! there was a problem. pm2 says: \`${err.msg}\``
            })
          } else {
            var res = 'PM2 processes:\n```\n';
            list.forEach(proc => res += `${proc.name}: ${proc.pm2_env.status} \n`)
            res += '```';
            slackbot.send({
              channel: bundle.msg.channel,
              text: res
            })
          }
        });
      }

      function handlerFn(err, apps) {
        pm2.disconnect();   // Disconnect from PM2
        if (err) {
          slackbot.send({
            channel: bundle.msg.channel,
            text: `bad news! there was a problem. pm2 says: \`${err.msg}\``
          })
        } else {
          slackbot.send({
            channel: bundle.msg.channel,
            text: `consider it done! 😎`
          }).then(() => {
            slackbot.send({text: `\`${pm2TargetProcess} ${pm2Action}\` succeeded!`});
          })
        }
      };
    });
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
