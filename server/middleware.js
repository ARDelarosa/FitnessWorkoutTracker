const { findUserWithToken } = require('./models');

const isLoggedIn = async(req, res, next)=> {
    try {
      const token = req.headers.authorization.split(' ')[1];
      req.user = await findUserWithToken(token);
      next();
    } catch (ex) {
      next(ex);
    }
  };

module.exports = { isLoggedIn };