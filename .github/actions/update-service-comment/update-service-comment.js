const core = require('@actions/core');
const github = require('@actions/github');
const { validateInputs } = require('../utils');
const { MARK, LABEL_VALUE_SEPARATOR } = require('../sharedConstants');

const ACTION_NAME = 'Update Service Comment';
const REQUIRED_INPUTS = ['auth-token', 'label', 'value'];

validateInputs(REQUIRED_INPUTS);

const authToken = core.getInput('auth-token');
const octokit = github.getOctokit(authToken, { userAgent: ACTION_NAME });
const { owner, repo, number: issue_number } = github.context.issue;


const updateValue = async ({ label, value, createIfNotFound }) => {
  const { data: comments } = await octokit.issues.listComments({ owner, repo, issue_number });
  const serviceComment = comments.find((comment) => comment.body.includes(MARK));

  if (!serviceComment) {
    throw new Error(`Can't find a service comment, make sure to create it first by using a "create" action type.`);
  }

  const parsedBody = serviceComment.body.split('\n');
  const labelIdx = parsedBody.findIndex((line) => line.includes(label));

  if (labelIdx === -1) {
    if (createIfNotFound) {
      console.log(`Can't find a label "${label}", creating a new one. If you want to change this behaviour - set "create-if-not-found" input to false`);
      parsedBody.push(`${label}${LABEL_VALUE_SEPARATOR}${value}`);
    } else {
      throw new Error(`Can't find a label "${label}", if you want to create a label if it's not found, set "create-if-not-found" input to true.`);
    }
  } else {
    const labelValue = parsedBody[labelIdx].split(LABEL_VALUE_SEPARATOR);

    labelValue[1] = value;
    parsedBody[labelIdx] = labelValue.join(LABEL_VALUE_SEPARATOR);
  }

  return octokit.issues.updateComment({ owner, repo, comment_id: serviceComment.id, body: parsedBody.join('\n') });
};

const run = async () => {
  const label = core.getInput('label');
  const value = core.getInput('value');
  const createIfNotFound = core.getInput('create-if-not-found');

  try {
    await updateValue({ label, value, createIfNotFound: createIfNotFound && JSON.parse(createIfNotFound) });
    console.log(`A value of ${label} successfully updated to "${value}"`);
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();
