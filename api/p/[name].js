const { getPrompt, getExecution } = require('../../lib/utils');

module.exports = async (req, res) => {

  const { query, method } = req;

  // TODO: Add state
  if (!query || !query.name) {
    return res.status(400).json({ error: 'missing_params' });
  }

  const executionId = query.name;

  if ('get' === method.toLowerCase()) {
    const execution = await getExecution(executionId);
    // TODO: Filter user and context before sending

    let output;
    try {
      output = await getPrompt(
        execution.currentAction.renderPromptUrl,
        {
          user: {
            name: execution.user.name,
            email: execution.user.email
          },
          context: {
            clientId: execution.context.clientId,
            domain: execution.context.domain,
            config: execution.config,
            formPostUrl: `https://${execution.context.domain}/p/?${executionId}`
          }
        }
      );
    } catch (error) {
      output = error.message;
    }

    return res.send(output);
  }

  res.json(query);
};
