const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const cors = require('cors');
const limiter = require('./middlewares/limiter');
require('dotenv').config();
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { LINK_DB = 'mongodb://localhost:27017/testmovie' } = process.env;

const app = express();
app.use(cors({
  origin: [
    'https://sxep-diplom.nomoredomains.club',
    'http://sxep-diplom.nomoredomains.club',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(LINK_DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

app.use(requestLogger);

app.use(limiter);

app.use('/', require('./routes/index'));

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
});

app.listen(process.env.PORT, () => {
  console.log(`Сервер запущен, порт ${process.env.PORT}`);
});
