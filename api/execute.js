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
  const responseObj = {
    executionId: uuidv4(),
    status: 'done',
    outcome: {}
  };

  // TODO: Get actions pipeline from somewhere
  const actions = await getActions(req.headers.host, stage);

  if (!actions) {
    return res.status(400).json(responseObj);
  }

  // TODO: Get actions from tenant for the stage we're processing
  actions.some((action) => {
    console.log(action.name);
    switch(action.type) {
      case 'code':
        // TODO: Implement handling
        try {
          action.process(user, context, config);
          return false;
        } catch (error) {
          responseObj.outcome.action = 'error';
          responseObj.outcome.error = {
            code: error.code || 'unknown',
            message: error.message
          };
          return true;
        }

      case 'prompt':
        responseObj.status = 'pending';
        responseObj.outcome = {
          action: 'prompt',
          path: action.promptUrl
        };
        return true;
    }
  });

  // TODO: Save current execution state with user, context, and current prompt data

  return res.status(200).json(responseObj);
};
