const jwt = require('jsonwebtoken');
const AutorizationError = require('../errors/AutorizationError');

const { JWT_SECRET = 'jdsg776599' } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new AutorizationError('Необходима авторизация'));
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    next(new AutorizationError('Необходима авторизация'));
  }

  req.user = payload;
  next();
};
