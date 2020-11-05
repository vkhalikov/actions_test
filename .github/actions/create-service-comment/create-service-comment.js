const core = require('@actions/core');
const github = require('@actions/github');
const { validateInputs } = require('../utils');
const { MARK, LABEL_VALUE_SEPARATOR } = require('../sharedConstants');

const ACTION_NAME = 'Create Service Comment';
const REQUIRED_INPUTS = ['auth-token'];
const DEFAULT_INFO_MESSAGE = `###### This comment was generated automatically by ${ACTION_NAME} action\n---\n`;

validateInputs(REQUIRED_INPUTS);

const authToken = core.getInput('auth-token');
const octokit = github.getOctokit(authToken, { userAgent: ACTION_NAME });
const { owner, repo, number: issue_number } = github.context.issue;

const constructCommentBody = ({ labels, bold, infoMessage }) => {
  const baseMassage = infoMessage === false ? '' : infoMessage || DEFAULT_INFO_MESSAGE;
  const body = MARK + baseMassage;

  if (!labels) {
    return body;
  }

  if (!Array.isArray(labels)) {
    throw new TypeError(`Labels should be an array, got ${typeof labels} instead.`);
  }

  let finalLabels = labels.map((placeholder) => {
    let result = placeholder + LABEL_VALUE_SEPARATOR;

    if (bold) {
      result = `**${result}**`;
    }

    return result;
  });

  const labelsString = finalLabels.join('\n');

  return body + labelsString;
};

const createComment = async ({ labels, bold, infoMessage }) => {
  const body = constructCommentBody({ labels, bold, infoMessage });

  return octokit.issues.createComment({ owner, repo, issue_number, body });
};

const run = async () => {
  const labels = core.getInput('labels');
  const bold = core.getInput('bold');
  const infoMessage = core.getInput('info-message');

  const createOptions = {
    labels: labels && JSON.parse(labels),
    bold: bold && JSON.parse(bold),
    infoMessage: infoMessage  === 'false' ? false : infoMessage,
  };

  try {
    const { data: { id, html_url } } = await createComment(createOptions);

    core.setOutput("comment-id", id);
    console.log(`Comment successfully created: ${html_url}`);
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();
