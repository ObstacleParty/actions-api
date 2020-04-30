const store = require('../../lib/store');

module.exports = async (req, res) => {

  const { query, params, method, body } = req;

  // Vercel uses query, Express uses params
  // TODO: Make this explicit when we choose a platform.
  if ((!query && !query.name) || (!params && !params.executionId)) {
    return res.status(400).json({ error: 'missing_params' });
  }

  const executionId = query.name || params.executionId;
  const execution = store.get(executionId);
  if (!execution) {
    return res.status(400).json({ error: 'invalid_id' });
  }

  // TODO: Bad idea to mutate?
  const currentAction = execution.actionLog.pop();

  if ('get' === method.toLowerCase()) {
    return res.status(200).json(currentAction);
  }

  if ('post' === method.toLowerCase()) {

    // We should only be accepting execution updates if we're waiting for them
    if ('prompt' !== currentAction.action) {
      return res.status(400).json({ error: 'invalid_execution_state' });
    }

    // TODO: Better user data handling ... don't want to update everything
    // Root profile updates should be explicit and part of the "permissions" for the Action
    // Should the metadata be namespaced? Maybe with the action name?
    if (body.user) {
      execution.user.user_metadata = {
        ...(execution.user.user_metadata || {}),
        ...body.user
      };
    }

    // TODO: Does it make sense to update context? Does this approach work?
    if (body.context) {
      execution.context.actions = {
        ...(execution.context.actions || {}),
        ...{[currentAction.name]: body.context}
      };
    }

    // TODO: Validate and improve this approach
    // This is a message from the Action Service that we should keep going or cancel
    currentAction.action = body.action || 'continue';

    execution.actionLog.push(currentAction);
    store.set(executionId, execution);
    return res.status(200).json(execution);
  }

  return res.status(404).json({ error: 'not_found' });
};
