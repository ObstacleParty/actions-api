module.exports = {

  prepareSlackMsg: (log) => {
    const logData = log.data || {};
    const errorDesc = logData.description || 'No description';
    const errorTitle = 'Auth0 log entry with ' +
      (logData.type ? `error code "${logData.type}"` : 'no error code');

    const message = {
      fallback: `${errorTitle}: ${errorDesc}`,
      title: errorTitle,
      color: '#ff0000',
      text: '> ' + errorDesc
    };

    if (logData.log_id) {
      message.title_link = `https://manage.auth0.com/#/logs/${logData.log_id}`;
    }

    if (logData.client_id) {
      message.fields = [
        {
          title: 'Client Name',
          value: logData.client_name || 'Dashboard'
        },
        {
          title: 'Client ID',
          value: logData.client_id || 'No Client ID'
        }
      ];
    }

    return message;
  }
};