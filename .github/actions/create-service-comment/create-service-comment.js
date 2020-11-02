const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const authToken = core.getInput('auth-token');
    const octokit = github.getOctokit(authToken, { userAgent: 'create-service-comment-action' });

    const context = github.context;

    console.log(`TOKEN: ${authToken}`);
    console.log(`The context: ${JSON.stringify(context, null, 2)}`);
    console.log(`The repo: ${JSON.stringify(context.repo, null, 2)}`);

    // const { data: pullRequest } = await octokit.pulls.get({
    //   owner: 'octokit',
    //   repo: 'rest.js',
    //   pull_number: 123,
    //   mediaType: {
    //     format: 'diff'
    //   }
    // });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
