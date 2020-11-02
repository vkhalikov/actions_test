const core = require('@actions/core');
const github = require('@actions/github');

const ACTION_NAME = 'Create Service Comment';
const DEFAULT_INFO_MESSAGE = `###### This comment was generated automatically by ${ACTION_NAME} action\n---\n`;

const constructCommentBody = (placeholders, { bold = true, infoMessage = DEFAULT_INFO_MESSAGE } = {}) => {
  const baseMassage = infoMessage || '';

  if (!placeholders) {
    return baseMassage;
  }

  if (!Array.isArray(placeholders)) {
    throw new TypeError(`Placeholders should be an array, got ${typeof placeholders} instead`);
  }

  let finalPlaceholders = placeholders;

  if (bold) {
    finalPlaceholders = placeholders.map((placeholder) => `**${placeholder}**`);
  }

  const placeholdersString = finalPlaceholders.join(':\n');

  return baseMassage + placeholdersString;
};

const run = async () => {
  try {
    const authToken = core.getInput('auth-token');
    const octokit = github.getOctokit(authToken, { userAgent: ACTION_NAME });
    const context = github.context;

    console.log(`TOKEN: ${authToken}`);
    const infoMessage = core.getInput('info-message');
    const placeholders = JSON.parse(core.getInput('placeholders'));

    const commentConstructorOptions = {
      bold: Boolean(core.getInput('bold')),
      infoMessage: infoMessage === 'false' ? false : infoMessage,
    };

    console.log(commentConstructorOptions);

    const body = constructCommentBody(placeholders, commentConstructorOptions);

    const comment = await octokit.issues.createComment({
      body,
      ...context.issue,
    });

    console.log(comment);
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();
