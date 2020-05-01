module.exports = async function executeActions(currentState, actions) {
  // TODO: Get actions from tenant for the stage we're processing
  // TODO: Make the action pipeline static for this request so continue is not affected by new actions
  let previousAction;
  const { actionLog, user, context, config } = await actions.reduce(async (accumulatorPromise, action) => {
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

          // FIXME: Need to update the user on Auth0

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
            action: 'prompt'
          }])
        };
    }
  }, currentState);

  return { actionLog, user, context, config };
};
