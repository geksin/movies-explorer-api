const Movie = require('../models/movie');
const NotFoundError = require('../errors/NotFoundError');
const AccessError = require('../errors/AccessError');


const errorsMessagee = {
  400: 'Переданы некорректные данные при создании карточки фильма',
  404: 'карточка или пользователь не найден',
  '404del': 'Видео с указанным _id не найдено',
  403: 'видео может удалить только создатель',
};

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.send({ movies }))
    .catch(next);
};

module.exports.createMovies = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  const owner = req.user.id;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner,
  })
    .then((movie) => {
      res.send({ movie });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new NotFoundError(errorsMessagee[400]));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovies = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (movie == null) {
        next(new NotFoundError(errorsMessagee['404del']));
      }
      if (movie.owner.equals(req.user.id)) {
        return movie.remove().then(() => res.send({ message: movie }));
      }
      return next(new AccessError(errorsMessagee[403]));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new NotFoundError(errorsMessagee['404del']));
      } else {
        next(err);
      }
    });
};
