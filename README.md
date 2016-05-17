![Do](/Qu1p1k8j.gif)

### Using Do

Within Slack, get Do's attention by telling it to run the `example` target's `test` verb, like so:

`@do test example`

Do will acknowledge your request in the channel you're in, and begin working!

Once the verb is complete, Do will announce the verb's final status and output logs.

If you ever forget what targets and verbs you have available to you, hit up Do for a list of them by typing `@do list`.

You can also issue any command to Do by DMing it. When DMing Do, it's not necessary to prefix your instructions with `@do`.

### Configuring targets

Targets can be anything you want to define a set of verbs for. Most of the time, you'll define a target for each codebase you want to automate with Do.

A target has a few settings that are required, and apply to the entire target:

- `name`: this is the name that you'll refer to the target. You can make it anything you want, but it's suggested that you stick to one lowercase word, for simplicity.
- `description`: A friendly reminder of what this is. Write what you'll want to remember when you open the file three months from now 😀
- `workingDir`: The directory **relative to Do's project root** (the folder this README is in!) where the sequences should be run. It's recommended to use the home directory shorthand `~` to keep things easy to read, and so you can move Do around without breaking everything.

##### Verbs

A target must also have verbs defined- that's what makes it useful!

Each verb has a `name` that it's referred to as, and a `sequence` array that defines the commands to be run.

Let's say I want to run `npm install --quiet`, `bower install`, and `pm2 start pm2.json`. My sequence would look like this:

```
sequence: [
  ['npm', 'install', '--quiet'],
  ['bower', `install`],
  ['pm2', 'start', 'pm2.json']
]
```

Be careful to not run long-lived processes! Currently, Do synchronously executes sequences. Running a long-lived process will lock up Do.

Each command will be run sequentially. If any command exits with a non-zero status code, the verb will stop executing early and report a failure.
