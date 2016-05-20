![Do](/assets/TL8gMbjz.gif)

**If you and your team use Slack, and still SSH into servers to complete routine tasks, Do will make your life easier.**

🚨🚨 **Note! Not everything here works yet- we're working towards a 1.0 release right now, and this README describes Do as of 1.0. Check out the [1.0.0 milestone](https://github.com/wemashinc/do/milestones/1.0.0) for insight on what's currently outstanding. Feel free to contribute!**

## Demo

![](http://g.recordit.co/Wk17StFZeC.gif)

Do is a very friendly bot who can run command sequences on remote systems on-demand, and drop the output in Slack when it's done.

## Why Do?

- Because sometimes, you don't need a CD system to build _every time_ someone pushes.
- Because sometimes, you'd rather pull out your own teeth than have to look up the syntax for that DB export again.
- Because sometimes, you wish your project manager could self-serve staging tasks.
- Because sometimes, "is that process still running?".
- Because sometimes, maybe, you should back everything up before testing that thing.

Do lets you define sequences of shell commands and arbitrary functions that automate the routine and mundane, and pipes the output back into Slack- where your entire team can see the results.

## Introduction

At the core of Do is the simple concept of targets and verbs.

Verbs are sequences of commands, and targets are the things that verbs are done to.

Generally, targets will be applications like `webapp`, `blog`, or `db`.
Verbs will be things such as `build`, `backup`, `start`, `stop`, `restart`, or `pull`.

There are few limitations about what you can teach Do to perform- it's all up to you!

Just remember to keep verb and target names lowercased, and without any whitespace in them.

## Getting Started

1. Clone this repository: `git clone https://github.com/wemashinc/do.git`.
2. Install Node and NPM if you don't have them already.
3. Install dependencies: `npm install`.
4. Run the setup wizard: `npm run setup`.
	- The wizard will guide you through setting up things on Slack's end as well.
5. Start Do: `npm start`.
	- Do will spin up a PM2 process to keep itself running in the background.
6. Invite Do to a Slack channel so you can talk to it: `/invite @[your-do-username]`
7. Confirm everything's working by talking to Do in that channel: `@[your-do-username] hello`.
	- Do should respond immediately.


## Talking to Do

Talking to Do is simple: to run verbs, you use the natural `[verb] [target]` pattern.

In a channel, you must prefix your commands with your Do's username to get it's attention, like this: `@do test example`. In a DM with Do, you'd just say `test example`.

For built-in commands, you simply say `[command]`. Like verbs, if you're in a channel you must get your Do's attention by mentioning it.

## Teaching Do

:thought_balloon: _Not your first rodeo? Want to get right down to business? Scroll down to "Target API Reference"._

So Do is running! Great. Let's teach Do about an imaginary JavaScript web application called Helloworld whose build process we want to automate.

The build process is as follows: 
- Pull latest code: `git pull`
- Get dependencies: `npm install` and `bower install`

#### Create a new target

First, let's create a new file in the `targets/` directory. 

For simplicity, we'll start with the `example` target as a template- so we'll make a copy of `example.js` called `helloworld.js`.  Do will automatically pick this file up next time it starts, so there's no need to include it anywhere.

We'll start off by changing the `name` property of our new target to `helloworld`, the `description` property to `'A very complex project that runs on port 3000!'`, and the `workingDir` property to `../helloworld`.

Our file now looks something like this:

```
module.exports = {
  verbs: [
    {
      name: 'test',
      sequence: [
        'echo hello'
      ]
    }
  ],

  name: 'helloworld',
  description: 'A very complex project that runs on port 3000!',
  workingDir: '../helloworld'
};

```

Looks great! Let's work on our verb next.

`'test'` isn't what we want to do here, so let's change the name of the verb to `'build'`.

We'll also add our build commands (`git pull`, `npm install`, and `bower install`) to the sequence array.

```
module.exports = {
  verbs: [
    {
      name: 'build',
      sequence: [
        'git pull',
        'npm install',
        'bower install'
      ]
    }
  ],

  name: 'helloworld',
  description: 'A very complex project that runs on port 3000!',
  workingDir: '../helloworld'
};

```

Bam! We have a working target. If Helloworld really existed, we could say `@do build helloworld` and we'd be off to the races.

## Built-in Commands
- `list`: lists all targets and verbs that Do knows about
- `hello`: returns some information about Do.
- `help`: links you to this README!

## Target API Reference

_documentation in progress_

## Contributing

_contribution guidelines in progress_

## Known Issues

- It's not possible to control processes through the `pm2` command. This is due to how PM2 communicates with itself- it doesn't work in the context of a child process.
	- Workaround: use the PM2 Node API in a function instead of using the PM2 shell interface (see examples above).
