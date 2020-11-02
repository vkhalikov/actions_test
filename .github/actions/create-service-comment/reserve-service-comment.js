const core = require('@actions/core');
const github = require('@actions/github');

try {
  const eventCtx = JSON.stringify(github.context.event, undefined, 2);
  const ctx = JSON.stringify(github.context, undefined, 2);

  console.log(`The event context: ${eventCtx}`);
  console.log(`The context: ${ctx}`);
} catch (error) {
  core.setFailed(error.message);
}
