'use strict';

let slack = require('slack');
let config = require('../../config');
let log = require('../utils/log').bind(null, 'slack');
var Promise = require('bluebird');


let bot = slack.rtm.client();
let token = config.slack.token;
let username = undefined;

log(`init`);

bot.hello(()=> log('Connected to Slack'));

var mentionString = null;

slack.auth.test({token}, (err, data) => {
  // get our user id so we can know when we're mentioned
  if(err) {
    throw new Error(err)
  } else {
    username = data.user;
    mentionString = `<@${data.user_id}>`;
  }
});

bot.message(msg => {
  if(msg.subtype === 'bot_message') {
    return;
  }
  
  if(msg.channel[0] === 'D') {
    // if we have recieved a direct message
    console.log(msg);
    processMention(msg);
  } else if(msg.text && msg.text.indexOf(mentionString) === 0) {
    processMention(msg);
  }
});

bot.listen({token});

// helper fns

function processMention(msg) {
  let cmd = msg.text
              .replace('>:', '>')
              .replace(`${mentionString} `, '')
              .split(' ');
  handlerFor('input')({cmd, msg});
};

function send(obj, fn) {
  return new Promise((resolve, reject) => {
    slack.chat.postMessage({
      token,
      channel: obj.channel || config.slack.outputChannel,
      text: obj.text,
      username,
      icon_emoji: config.slack.emoji
    }, (err, data) => {
      if(err) {
        reject(err);
      } else {
        resolve(data);
      }
    })
  })
}

function createPost(obj) {
  var {content, comment, filename} = obj;
  return slack.files.upload({
    token,
    content,
    initial_comment: comment,
    file: null,
    filename,
    channels: config.slack.outputChannel
  }, () => {})
}

// eventing stuff

// events:
// 'input': fires when a valid input command is recieved

let handlers = {};

function registerEvent(evt, fn) {
  return handlers[evt] = fn;
};

function handlerFor(evt) {
  return handlers[evt] || log;
}

module.exports = {on: registerEvent, send, createPost};
