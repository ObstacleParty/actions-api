const { v4: uuidv4 } = require('uuid');

const { getActions } = require('../lib/utils');
const store = require('../lib/store');
const executeActions = require('../lib/executeActions');
const { ALLOWED_STAGES } = require('../lib/constants');

module.exports = async (req, res) => {

  const { body } = req;

  if (!body || !body.stage || !body.user || !body.context || !body.config) {
    return res.status(400).json({ error: 'missing_params' });
  }

  // TODO: add state, rules
  const { stage, user, context, config } = body;

  if (!ALLOWED_STAGES.includes(stage)) {
    return res.status(400).json({ error: 'invalid_stage' });
  }

  // TODO: stronger body checking

  const initialResponse = {
    executionId: null,
    status: 'done',
    actionLog: []
  };

  const actions = await getActions(context.domain, stage);

  if (!actions) {
    return res.json(initialResponse);
  }

  const executionId = uuidv4();
  initialResponse.executionId = executionId;

  const { actionLog, user: newUser, context: newContext, config: newConfig } = await executeActions(
    {actionLog: [], user, context, config },
    actions
  );

  const finalResponse = {
    ...initialResponse,
    status: actionLog[actionLog.length - 1].status,
    actionLog
  };

  store.set(executionId, {user: newUser, context: newContext, config: newConfig, actionLog, pipeline: actions});

  return res.json(finalResponse);
};
