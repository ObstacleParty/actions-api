const { v4: uuidv4 } = require('uuid');

const { getActions } = require('../lib/utils');

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

  // TODO: Check for existing execution to pick up where we left off
  const initialResponse = {
    executionId: uuidv4(),
    status: 'done',
    outcome: {},
    actionLog: []
  };

  // TODO: Get actions pipeline from somewhere
  const actions = await getActions(req.headers.host, stage);

  if (!actions) {
    return res.status(400).json(initialResponse);
  }

  // TODO: Get actions from tenant for the stage we're processing
  const { actionLog } = actions.reduce(({ actionLog, user, context, config }, action) => {
    const previousAction = actionLog[actionLog.length - 1];

    if(previousAction && previousAction.status !== 'success') {
      return { actionLog, user, context, config };
    }

    console.log(action.name);
    switch(action.type) {
      case 'code':
        // TODO: Implement handling
        try {
          const { user: newUser, context: newContext, config: newConfig} = action.process(user, context, config);
          return {
            user: newUser,
            context: newContext,
            config: newConfig,
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
            config,
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
          config,
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

  const lastResult = actionLog[actionLog.length - 1];

  const finalResponse = {
    ...initialResponse,
    status: lastResult.status,
    outcome: lastResult.outcome,
    actionLog
  };
  // TODO: Save current execution state with user, context, and current prompt data

  return res.status(200).json(finalResponse);
};
