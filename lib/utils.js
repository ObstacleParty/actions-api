const getActions = async (tenantDomain, stage) => {

  // TODO: Get stage actions from tenantDomain
  return [
    {
      name: 'validate_email_domain',
      type: 'code',
      process: async (user, context, config = {}) => {
        console.log({user, context, config});
        user.email_domain_valid = true;
        return { user, context };
      }
    },
    {
      name: 'terms_and_conditions',
      type: 'prompt',
      promptUrl: '/p/teams-and-conditions',
      renderPromptUrl: 'https://api.example.com/teams-and-conditions/render',
      handlePromptUrl: 'https://api.example.com/teams-and-conditions/handle'
    },
    {
      name: 'throw_an_error',
      type: 'code',
      process: (user, context, config = {}) => {
        throw new Error('🤷‍♂️');
      }
    },
    {
      name: 'enrich_profile',
      type: 'code',
      process: async (user, context, config = {}) => {
        console.log({user, context, config});
        user.user_metadata = {
          geo: '100,200',
          twitter: 'fakeuser'
        };
        return { user, context };
      }
    },
  ];
};

module.exports = {
  getActions
};
