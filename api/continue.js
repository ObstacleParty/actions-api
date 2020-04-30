const store = require('../lib/store');
const executeActions = require('../lib/executeActions');

module.exports = async (req, res) => {
  const { params } = req;

  const executionId = params.executionId;
  const execution = store.get(executionId);
  if (!execution) {
    return res.status(400).json({ error: 'invalid_id' });
  }

  const { actionLog, pipeline } = execution;


  const currentActionLogEntry = actionLog[actionLog.length - 1];

  if(currentActionLogEntry.action !== 'continue') {
    return res.status(400).json({ error: 'continue_unavailable' });
  }

  currentActionLogEntry.status = 'success';

  // find any action in the pipeline that doesn't have a log entry
  const remainingActions = pipeline.filter(action => {
    const matchingLog = actionLog.find(actionLogEntry => actionLogEntry.name === action.name);

    return !matchingLog;
  });

  const { actionLog: newActionLog, user: newUser, context: newContext, config: newConfig } = await executeActions(
    execution,
    remainingActions
  );

  const response = {
    executionId,
    status: newActionLog[newActionLog.length - 1].status,
    actionLog: newActionLog
  };

  store.set(executionId, {user: newUser, context: newContext, config: newConfig, actionLog: newActionLog, pipeline: execution.pipeline });

  return res.json(response);
};
