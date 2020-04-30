const getActions = async (tenantHost, stage) => [
  {
    name: 'validate_email_domain',
    type: 'code',
    process: (user, context, config = {}) => {
      return { error: null, user, context, config };
    }
  },
  {
    name: 'terms_and_conditions',
    type: 'prompt',
    promptUrl: '/api/p/teams-and-conditions',
    renderPromptUrl: 'https://api.example.com/teams-and-conditions/render',
    handlePromptUrl: 'https://api.example.com/teams-and-conditions/handle'
  },
  // {
  //   name: 'throw_an_error',
  //   type: 'code',
  //   process: (user, context, config = {}) => {
  //     throw new Error('🤷‍♂️');
  //   }
  // },
  {
    name: 'enrich_profile',
    type: 'code',
    process: (user, context, config = {}) => {
      return { error: null, user, context, config };
    }
  },
];

// TODO: Call the custom prompts API
const getPrompt = (renderPromptUrl, postData) => {
  // => POST postData to renderPromptUrl
  return `<!DOCTYPE html>
    <html lang="en">
      <h1>HELLO ${postData.user.name}!</h1>
      <form action="${postData.context.formPostUrl}">
        <label><input></label>
        <input type="submit">
      </form>
    </html>`;
};

// Perform a lookup on execution ID
// TODO: Handle invalid/complete/etc id
const getExecution = (executionId) => ({
  user: { id: 'auth0|123456789', email: 'josh@auth0.com', name: 'Josh Cunningham' },
  context: { clientId: '1q2w3e4r5t6y7u8i9o0p', domain: 'tenant.auth0.com' },
  config: { secret1: '1q2w3e4r5t6y7u8i9o0p', secret2: 'a1s2d3f4g5h6j7k8l9' },
  currentAction: getActions()[1]
});

module.exports = {
  getActions,
  getPrompt,
  getExecution
};
