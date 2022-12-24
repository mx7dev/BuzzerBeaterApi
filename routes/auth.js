const express = require('express');
const passport = require('passport');
const boom = require('@hapi/boom');
const jwt = require('jsonwebtoken');
const UserService = require('../services/users');
const { config } = require('../config/index');
const { params } = require('../utils/params');

//Basic startegy
require('../utils/auth/basic');

//JWT strategy
require('../utils/auth/jwt');

function authApi(app) {
  const router = express.Router();
  app.use(`${params.urlAPi}api/auth`, router);
  const userService = new UserService();

  router.post('/sign-in', async function (req, res, next) {
    //const { body: user } = req;

    passport.authenticate('basic', function (error, user) {
      try {
        if (error || !user || user === 'undefined') {
          next(boom.unauthorized());
        }

        req.login(user, { session: false }, async function (error) {
          if (error) {
            next(error);
          }
          const payload = {
            sub: user.snames,
            email: user.semail,
            user: user.suser,
          };

          const token = jwt.sign(payload, config.apiKey, {
            expiresIn: '60m',
          });

          return res.status(200).json({ token, user });
        });
      } catch (error) {
        next(error);
      }
    })(req, res, next);
  });

  router.post('/sign-up', async function (req, res, next) {
    const { body: user } = req;

    try {
      userService.createUser(user, (userCreate) => {
        res.status(200).json({
          data: userCreate,
          //message: 'user created',
        });
      });
    } catch (error) {
      next(error);
    }
  });

  router.get(
    '/logout',
    passport.authenticate('jwt', { session: false }),
    async function (req, res, next) {
      //const { body: user } = req;
      req.logout();
      try {
        res.status(200).json({
          status: 'Bye!',
        });
      } catch (error) {
        next(error);
      }
    }
  );
}

module.exports = authApi;
