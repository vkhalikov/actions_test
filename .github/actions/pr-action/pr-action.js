const core = require('@actions/core');
const github = require('@actions/github');

const time = core.getInput('time');
const name = core.getInput('worm-name');

setTimeout(() => {
  console.log(`The time has come, Mr. Worm ${name}`);
  const score = Math.random();

  if (score < 0.5) {
    core.setFailed(`Failed with score: ${score}`);
  }
}, time * 1000);
