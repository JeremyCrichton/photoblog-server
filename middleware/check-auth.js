/**
 * Validate an incoming request from its token
 */

const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
  // First, just allow browser optioins request to continue
  if (req.method === 'OPTIONS') {
    return next();
  }

  // extract token from incoming request header
  // headers property is provided by request & contains kv pairs

  // 2 possible errors here
  // 1. try-catch looking for if auth header hasn't been set, as trying to run split method would fail
  // 2. if (!token) looking for if whatever's in the auth header doesn't give us a token
  try {
    const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      throw new Error('Authentication failed!');
    }
    // Validate token
    // if this validation fails, it will throw an error and thus make it to the catch block
    const decodedToken = jwt.verify(token, 'supersecret_dont_share');

    // Add data to the request
    req.userData = { userId: decodedToken.userId };

    // Allow request to continue
    next();
  } catch (err) {
    // return to ensure no code after this executes
    return next(new HttpError('Authentication failed!', 403));
  }
};
