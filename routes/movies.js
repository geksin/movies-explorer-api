const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const {
  getMovies, createMovies, deleteMovies,
} = require('../controllers/movies');

router.get('/', getMovies);

const urlCheck = (value, helper) => {
  if (validator.isURL(value)) {
    return value;
  }
  return helper.message('Проверьте правильность ссылки');
};

router.post('/', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().custom(urlCheck),
    trailer: Joi.string().required().custom(urlCheck),
    thumbnail: Joi.string().required().custom(urlCheck),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), createMovies);

router.delete('/:movieId', celebrate(
  {
    params: Joi.object().keys({
      movieId: Joi.string().required().length(24).hex(),
    }),
  },
), deleteMovies);

module.exports = router;
