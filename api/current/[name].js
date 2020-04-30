const store = require('../../lib/store');

module.exports = async (req, res) => {

  const { query, params, method } = req;

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

  switch (method.toLowerCase()) {
    case 'post':
      return res.status(200).json(execution);

    case 'get':
      return res.status(200).json(execution.actionLog.pop());

    default:
      return res.status(404).json({ error: 'not_found' });
  }
};
