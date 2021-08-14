const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const NotFoundError = require('../errors/NotFoundError');
const RequestError = require('../errors/RequestError');
const AutorizationError = require('../errors/AutorizationError');
const AlreadyHaveError = require('../errors/AlreadyHaveError');
const AccessError = require('../errors/AccessError');

const { JWT_SECRET = 'jdsg776599' } = process.env;

const errorsMessagee = {
  400: 'Переданы некорректные данные при создании пользователя',
  '400login': 'Не заполнены все поля',
  '400user': 'Переданы некорректные данные при обновлении профиля',
  401: 'Логин или пароль не правильные',
  404: 'Пользователь по указанному _id не найден',
  '404email': 'Пользователь с такой почтой не найден',
  409: 'Пользователь c такой почтой уже существует',
  '403up': 'нельзя обновить данные другого пользователя',
};

module.exports.getMe = (req, res, next) => {
  const userid = req.user.id;
  User.findById(userid)
    .then((user) => res.send({ user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new RequestError(errorsMessagee[400]));
      }
      if (err.name === 'CastError') {
        next(new NotFoundError(errorsMessagee[404]));
      } else {
        next(err);
      }
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, password, email,
  } = req.body;
  return bcrypt.hash(password, 8, (err, hash) => User.findOne({ email })
    .then((user) => {
      if (user) {
        next(new AlreadyHaveError(errorsMessagee[409]));
      }
      return User.create({
        name, password: hash, email,
      })
        .then(() => res.status(200).send({
          name, email,
        }));
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new RequestError(errorsMessagee[400]));
      } else {
        next(error);
      }
    }));
};

module.exports.updateProfile = (req, res, next) => {
  User.findByIdAndUpdate(req.user.id, req.body,
    {
      new: true,
      runValidators: true,
      upsert: true,
    })
    .then((user) => res.send({ user }))
    .catch((err) => {
      if (err.codeName === 'DuplicateKey' && err.code === 11000) {
        next(new AccessError(errorsMessagee['403up']));
      }
      if (err.name === 'ValidationError') {
        next(new RequestError(errorsMessagee[400]));
      }
      if (err.name === 'CastError') {
        next(new NotFoundError(errorsMessagee[404]));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    next(new RequestError(errorsMessagee['400login']));
  }

  return User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return next(new NotFoundError(errorsMessagee['404email']));
      }
      return bcrypt.compare(password, user.password, (err, isValid) => {
        if (!isValid) {
          return next(new AutorizationError(errorsMessagee[401]));
        }
        const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).send({ id: user.id, token });
      });
    })
    .catch(next);
};
