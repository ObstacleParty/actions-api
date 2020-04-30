module.exports = {

  getActions: () => [
    {
      name: 'validate_email_domain',
      type: 'code',
      process: (user, context, config = {}) => {
        return {
          error: null,
          user,
          context
        };
      }
    },
    // {
    //   name: 'throw_an_error',
    //   type: 'code',
    //   process: (user, context, config = {}) => {
    //     throw new Error('🤷‍♂️');
    //   }
    // },
    {
      name: 'terms_and_conditions',
      type: 'prompt',
      promptUrl: '/p/teams-and-conditions'
    },
    {
      name: 'enrich_profile',
      type: 'code',
      process: (user, context, config = {}) => {
        return {
          error: null,
          user,
          context
        };
      }
    },
  ]
};