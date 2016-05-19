import {exec} from 'child_process'
import expandTilde from 'expand-tilde'
import Promise from 'bluebird'
import Log from '../utils/log'

let log = Log.bind(null, 'runner');


function run(slackbot, bundle, verb, target) {
  log(`Starting ${verb.name} ${target.name}`)
  slackbot.send({
    channel: bundle.msg.channel,
    text: `i'm on it! 👍`
  })
    .then(execSequence.bind(null, verb.sequence, target))
    .then(processResult)
    .then(sendOutput.bind(null, {slackbot, bundle}));
}

module.exports = {run};

function execSequence(sequence, target) {
  var outs = []; // stdouts and stderrs
  var promiseArray = [];

  // prepare the function-wrapped promise array
  // we wrap promises so they don't start executing until we're ready
  // so we can run commands strictly in sequence!
  sequence.forEach(cmd => {
    if(typeof cmd === 'function') {
      promiseArray.push(function() {
        return cmd()
          .then(res => ({
            cmd: 'anonymous fn',
            stdout: res + '\n',
            error: null
          }))
          .catch(res => new Promise((resolve, reject) => reject({
              cmd: 'anonymous fn (failed)',
              error: res + '\n'
            }))
          )
      });
    } else {
      if(Array.isArray(cmd)) {
        // support legacy array format, e.g.: ['npm', 'install']
        cmd = cmd.join(' ');
      }
      promiseArray.push(function() {
        return executeInShell({cmd, target});
      });
    };

  })

  // kick off the unwrap step
  return unwrapPromises({arr: promiseArray});
}

function unwrapPromises({arr, i = 0, results = []}) {
  // recursive fn that acts like a map function,
  // and flows like a waterfall function.
  var fn = arr[i];
  if(arr[i+1]) {
    return fn()
      .then(res => {
        results.push(res);
        return unwrapPromises({arr, i: i + 1, results});
      })
      .catch(res => {
        results.push(res);
        return new Promise(r => r(results));
      })
  } else {
    return fn()
      .then(res => {
        results.push(res);
        return new Promise(r => r(results));
      });
  }
}

function executeInShell({cmd, target}) {
  return new Promise((resolve, reject) => {
    log(`running '${cmd}'`)
    exec(cmd, {
      cwd: expandTilde(target.workingDir)
    }, (error, stdout, stderr) => {
      if(error) {
        reject({error, stdout, stderr, cmd: cmd + ' (failed)'});
      } else {
        resolve({error, stdout, stderr, cmd});
      }
    });
  })
}

function processResult(outputs) {
  var isSuccessful = true;
  var outputLog = '';

  outputs.forEach(output => {
    outputLog += `>>> ${output.cmd} \n`;

    if(output.error === null) {
      outputLog += `${output.stdout.toString()}`;
      if(output.stderr) {
        outputLog += (output.stderr.toString())
      }
    } else {
      outputLog += (`${output.stderr ? output.stderr.toString() : output.error}`);
      isSuccessful = false;
    }

  })

  return {outputLog, isSuccessful};
}

function sendOutput({slackbot, bundle}, {outputLog, isSuccessful}) {
  if (isSuccessful) {
    // report a sequence success
    slackbot.createPost({
      content: outputLog,
      comment: `<@${bundle.msg.user}> \`${bundle.cmd.join(' ')}\` succeeded!`,
      filename: `${bundle.cmd.join(' ')} at ${Date()}`
    });
  } else {
    slackbot.createPost({
      content: outputLog,
      comment: `<@${bundle.msg.user}> \`${bundle.cmd.join(' ')}\` failed.`,
      filename: `${bundle.cmd.join(' ')} at ${Date()}`
    });
  }
}
