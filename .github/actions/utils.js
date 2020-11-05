const core = require('@actions/core');

const validateInputs = (requiredInputs) => {
  requiredInputs.forEach((input) => {
    const value = core.getInput(input);

    if (value === '') {
      throw new Error(`${input} is required`);
    }
  });
};

module.exports = {
  validateInputs,
};
