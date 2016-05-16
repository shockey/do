var exec = require('child_process').spawnSync;
var expandTilde = require('expand-tilde');
var Promise = require('bluebird');


function run(slackbot, bundle, verb, target) {
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
  sequence.forEach(cmd => {
    promiseArray.push(function() {
      return executeInShell({
        binary: cmd[0],
        args: cmd.slice(1),
        target
      });
    });
  })

  // kick off the unwrap step
  // console.log(unwrapPromises({arr: promiseArray}));
  return unwrapPromises({arr: promiseArray});
}

function unwrapPromises({arr, i = 0, results = []}) {
  var fn = arr[i];
  if(arr[i+1]) {
    return fn()
      .then(res => {
        results.push(res);
        return unwrapPromises({arr, i: i + 1, results});
      });
  } else {
    return fn()
      .then(res => {
        results.push(res);
        return new Promise(r => r(results));
      });
  }
}

function executeInShell({binary, args, target}) {
  return new Promise((resolve, reject) => {
    var execRes = exec(binary, args || [], {
      cwd: expandTilde(target.workingDir),
      shell: true
    });
    resolve({
      execRes,
      cmd: (`${binary} ${args.join(' ')}`)
    });
  })
}

function processResult(outputs) {
  console.log(outputs);

  var isSuccessful = true;
  var outputLog = '';

  outputs.forEach(output => {
    outputLog += `>>> ${output.cmd} \n`;

    if(output.execRes.status === 0) {
      outputLog += `${output.execRes.stdout.toString()}`;
      if(output.execRes.stderr) {
        outputLog += (output.execRes.stderr.toString())
      }
    } else {
      outputLog += (`${output.execRes.stderr ? output.execRes.stderr.toString() : output.execRes.error.code}`);
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
