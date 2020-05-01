const getActions = async (tenantDomain, stage) => {

  // TODO: Get stage actions from tenantDomain
  return [
    {
      name: 'validate_email_domain',
      type: 'code',
      process: async (user, context, config = {}) => {
        console.log({user, context, config});
        user.user_metadata = {
          ...(user.user_metadata || {}),
          ...{ email_domain_valid: true }
        };
        return { user, context };
      }
    },
    {
      name: 'favorite_color_prompt',
      type: 'prompt',
      renderPromptUrl: 'https://geoff.sandbox.auth0-extend.com/generate_markup',
      handlePromptUrl: 'https://geoff.sandbox.auth0-extend.com/handle_prompt'
    },
    // {
    //   name: 'id_proofing_with_onfido',
    //   type: 'prompt',
    //   renderPromptUrl: 'https://dx-eco-h7n-2020-q2-prompts.sandbox.auth0-extend.com/generate_markup',
    //   handlePromptUrl: 'https://dx-eco-h7n-2020-q2-prompts.sandbox.auth0-extend.com/handle_prompt'
    // },

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
      process: async (user, context, config = {}) => {
        console.log({user, context, config});
        user.user_metadata = {
          ...(user.user_metadata || {}),
          ...{
            geo: '100,200',
            twitter: 'twitteruser'
          }
        };
        return { user, context };
      }
    },
  ];
};

module.exports = {
  getActions
};
