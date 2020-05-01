const got = require('got');

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

  if ('get' === method.toLowerCase()) {
    return res.status(200).json(execution);
  }

  if ('post' === method.toLowerCase()) {

    // TODO: Bad idea to mutate?
    const currentAction = execution.actionLog.pop();

    // We should only be accepting execution updates if we're waiting for them
    if ('prompt' !== currentAction.action) {
      return res.status(400).json({ error: 'invalid_execution_state' });
    }

    // TODO: Does it make sense to update context? Does this approach work?
    if (body.context && typeof body.context === 'object') {
      execution.context.actions = {
        ...(execution.context.actions || {}),
        ...{[currentAction.name]: body.context}
      };

      currentAction.contextUpdates = body.context;
    }

    // TODO: Address overall data handling here
    const userUpdates = {};

    if (body.user && typeof body.user === 'object') {
      execution.user.user_metadata = {
        ...(execution.user.user_metadata || {}),
        ...body.user
      };

      userUpdates.user_metadata = body.user;
    }

    if (body.user_metadata && typeof body.user_metadata === 'object') {
      execution.user.user_metadata = {
        ...(execution.user.user_metadata || {}),
        ...body.user_metadata
      };

      userUpdates.user_metadata = { ...(userUpdates.user_metadata || {}), ...body.user_metadata };
    }

    if (body.app_metadata && typeof body.app_metadata === 'object') {
      execution.user.app_metadata = {
        ...(execution.user.app_metadata || {}),
        ...body.app_metadata
      };

      userUpdates.app_metadata = { ...(userUpdates.app_metadata || {}), ...body.app_metadata };
    }

    // TODO: Don't use the Management API ...
    if (Object.keys(userUpdates).length) {
      currentAction.userUpdates = userUpdates;
      try {
        await got(
          `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${execution.user.user_id}`,
          {
            body: userUpdates,
            json: true,
            responseType: 'json',
            method: 'patch',
            headers: {
              Authorization: `Bearer ${process.env.AUTH0_API_TOKEN}`,
              'Content-type': 'application/json'
            }
          }
        );
      } catch (error) {
        console.log(error);
      }
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
