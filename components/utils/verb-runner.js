var exec = require('child_process').spawnSync;

function run(slackbot, bundle, verb, target) {
  slackbot.send({
    channel: bundle.msg.channel,
    text: `i'm on it! 👍`
  }).then(() => {
    var result = execSequence(verb.sequence, target);

    var outputLog = '';
    result.outs.forEach(output => outputLog += output + '\n');

    if(result.success) {
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
  })
}

function execSequence(sequence, target) {

  var hasSequenceFailed = false;

  var outs = []; // stdouts and stderrs

  sequence.forEach(cmd => {
    if(hasSequenceFailed) {
      return;
    }

    var bin = cmd[0];
    var args = cmd.slice(1);
    var res = exec(bin, args || [], {
      cwd: target.workingDir,
      shell: true
    });

    var commandSuccess = res.status === 0;


    var out = '';

    out += `>>> ${cmd.join(' ')} \n`;

    if(commandSuccess) {
      out += `${res.stdout.toString()}`;
      if(res.stderr) {
        out += (res.stderr.toString())
      }
    } else {
      out += (`${res.stderr ? res.stderr.toString() : res.error.code}`);
      hasSequenceFailed = true;
    }

    outs.push(out);
  })

  // at this point, the sequence has finished

  return {
    success: !hasSequenceFailed,
    outs
  }; // return true for success, false for failure

}

module.exports = {run};
