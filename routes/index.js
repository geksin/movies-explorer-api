const router = require('express').Router();
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/NotFoundError');

router.use('/signin', require('./singin'));
router.use('/signup', require('./singup'));

router.use('/users', auth, require('./users'));
router.use('/movies', auth, require('./movies'));

router.use('*', (req, res, next) => {
  next(new NotFoundError('Некорректный адрес'));
});

module.exports = router;
