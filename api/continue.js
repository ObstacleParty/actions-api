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

  // TODO: What would be reasons for the server calling this? Can we recover?
  if (currentActionLogEntry.action !== 'continue') {
    return res.status(400).json({ error: 'continue_unavailable' });
  }

  currentActionLogEntry.status = 'success';

  // TODO: Could we get into a situation where we have unfinished actions out of order?
  // find any action in the pipeline that doesn't have a log entry
  const remainingActions = pipeline.filter(action => {
    const matchingLog = actionLog.find(actionLogEntry => actionLogEntry.name === action.name);

    return !matchingLog;
  });

  const { actionLog: newActionLog, user: newUser, context: newContext, config: newConfig } = await executeActions(
    execution,
    remainingActions
  );

  // TOOD: Still a lot of shared logic with execute.
  // Maybe /execute takes an execution ID and remove /continue?
  const response = {
    executionId,
    status: newActionLog[newActionLog.length - 1].status,
    actionLog: newActionLog
  };

  store.set(
    executionId,
    {
      user: newUser,
      context: newContext,
      config: newConfig,
      actionLog: newActionLog,
      pipeline: execution.pipeline
    }
  );

  // TODO: Maybe when actions are complete, store execution in logs and rm from memory?

  return res.json(response);
};
