const { v4: uuidv4 } = require('uuid');

const { getActions } = require('../lib/utils');
const store = require('../lib/store');

module.exports = async (req, res) => {

  const { body } = req;

  if (!body || !body.stage || !body.user || !body.context || !body.config) {
    return res.status(400).json({ error: 'missing_params' });
  }

  // TODO: add state, rules
  const { stage, user, context, config } = body;

  const ALLOWED_STAGES = [
    'pre_login', 'post_login', 'post_change_password',
    'pre_user_registration', 'post_user_registration'
  ];

  if (!ALLOWED_STAGES.includes(stage)) {
    return res.status(400).json({ error: 'invalid_stage' });
  }

  // TODO: stronger body checking

  const initialResponse = {
    executionId: null,
    status: 'done',
    outcome: {},
    actionLog: []
  };

  const actions = await getActions(context.domain, stage);

  if (!actions) {
    return res.json(initialResponse);
  }

  const executionId = uuidv4();
  initialResponse.executionId = executionId;

  // TODO: Get actions from tenant for the stage we're processing
  // TODO: Make the action pipeline static for this request so continue is not affected by new actions
  let previousAction;
  const { actionLog } = await actions.reduce(async (accumulatorPromise, action) => {
    const { actionLog, user, context, config } = await accumulatorPromise;
    previousAction = actionLog[actionLog.length - 1];

    if (previousAction && previousAction.status !== 'success') {
      return { actionLog, user, context, config };
    }

    switch(action.type) {

      case 'code':
        try {
          const { user: newUser, context: newContext} = await action.process(user, context, config);
          return {
            user: newUser,
            context: newContext,
            actionLog: actionLog.concat([{
              name: action.name,
              type: action.type,
              status: 'success'
            }]),
          };
        } catch (error) {
          return {
            user,
            context,
            actionLog: actionLog.concat([{
              name: action.name,
              type: action.type,
              status: 'error',
            }])
          };
        }

      case 'prompt':
        return {
          user,
          context,
          actionLog: actionLog.concat([{
            name: action.name,
            type: action.type,
            status: 'pending',
            outcome: {
              action: 'prompt',
              path: action.promptUrl
            }
          }])
        };
    }
  }, { actionLog: [], user, context, config });

  const finalResponse = {
    ...initialResponse,
    status: previousAction.status,
    outcome: previousAction.outcome,
    actionLog
  };

  store.set(executionId, {user, context, config, actionLog});

  return res.json(finalResponse);
};
