const got = require('got');

module.exports = async (req, res) => {

  const { body, headers, query } = req;

  return res.status(200).json({});
};
