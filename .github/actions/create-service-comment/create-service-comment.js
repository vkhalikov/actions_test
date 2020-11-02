const core = require('@actions/core');
const github = require('@actions/github');
const fsPromises = require('fs').promises;

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

    const infoMessage = core.getInput('info-message');
    const placeholders = JSON.parse(core.getInput('placeholders'));
    const commentConstructorOptions = {
      bold: JSON.parse(core.getInput('bold')),
      infoMessage: infoMessage === 'false' ? false : infoMessage,
    };

    const { owner, repo, number: issue_number } = context.issue;
    const body = constructCommentBody(placeholders, commentConstructorOptions);

    const comment = await octokit.issues.createComment({ owner, repo, issue_number, body });

    core.setOutput("comment-id", comment.data.id);

    const OUTPUT_FILE_NAME = 'service_comment_info.json';
    const filehandle = await fsPromises.open(OUTPUT_FILE_NAME, 'w');

    await filehandle.writeFile(JSON.stringify(comment.data, null, 2));

    await filehandle.close();

    core.setOutput("path-to-output", OUTPUT_FILE_NAME);
    console.log(`Successfully created ${OUTPUT_FILE_NAME}`);

    console.log(comment);
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
};

run();
