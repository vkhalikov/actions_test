const core = require('@actions/core');
const github = require('@actions/github');
const fsPromises = require('fs').promises;

const ACTION_NAME = 'Create Service Comment';
const DEFAULT_INFO_MESSAGE = `###### This comment was generated automatically by ${ACTION_NAME} action\n---\n`;

const constructCommentBody = (labels, { bold = true, infoMessage } = {}) => {
  const baseMassage = infoMessage === false ? '' : infoMessage || DEFAULT_INFO_MESSAGE;

  if (!labels) {
    return baseMassage;
  }

  if (!Array.isArray(labels)) {
    throw new TypeError(`Labels should be an array, got ${typeof labels} instead`);
  }

  let finalLabels = labels;

  if (bold) {
    finalLabels = labels.map((placeholder) => `**${placeholder}**`);
  }

  const labelsString = finalLabels.join(':\n');

  return baseMassage + labelsString;
};

const run = async () => {
  try {
    const authToken = core.getInput('auth-token');
    const octokit = github.getOctokit(authToken, { userAgent: ACTION_NAME });
    const context = github.context;

    const infoMessage = core.getInput('info-message');
    const labels = JSON.parse(core.getInput('labels'));
    const commentConstructorOptions = {
      bold: JSON.parse(core.getInput('bold')),
      infoMessage: infoMessage === 'false' ? false : infoMessage,
    };

    const { owner, repo, number: issue_number } = context.issue;
    const body = constructCommentBody(labels, commentConstructorOptions);

    const comment = await octokit.issues.createComment({ owner, repo, issue_number, body });

    core.setOutput("comment-id", comment.data.id);

    const OUTPUT_FILE_NAME = 'service_comment_data.json';

    await fsPromises.writeFile(OUTPUT_FILE_NAME, JSON.stringify(comment.data, null, 2));

    core.setOutput("path-to-output", OUTPUT_FILE_NAME);
    console.log(`Successfully created ${OUTPUT_FILE_NAME}`);
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();
