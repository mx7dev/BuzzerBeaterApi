const express = require('express');
const passport = require('passport');
const UtilService = require('../services/util');
const { params } = require('../utils/params');

//JWT strategy
require('../utils/auth/jwt');

function utilsApi(app) {
  const router = express.Router();
  app.use(`${params.urlAPi}api/utils`, router);
  const utilService = new UtilService();

  router.get(
    '/listParams/:key',
    passport.authenticate('jwt', { session: false }),
    async function (req, res, next) {
      const { key } = req.params;
      try {
        await utilService.listParameters(key, (result) => {
          res.status(200).json({
            data: result,
          });
        });
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    '/listCategories/:id_type',
    passport.authenticate('jwt', { session: false }),
    async function (req, res, next) {
      const { id_type } = req.params;
      try {
        await utilService.listCategories(id_type, (result) => {
          res.status(200).json({
            data: result,
          });
        });
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    '/listAmountsPerYear/:id_year/:id_user',
    passport.authenticate('jwt', { session: false }),
    async function (req, res, next) {
      try {
        await utilService.listAmountsPerYear(
          req.params.id_year,
          req.params.id_user,
          (result) => {
            res.status(200).json({
              data: result,
            });
          }
        );
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    '/listAmountsPerMonth/:id_user/:id_year/:id_month',
    passport.authenticate('jwt', { session: false }),
    async function (req, res, next) {
      try {
        await utilService.listAmountsPerMonth(
          req.params.id_user,
          req.params.id_year,
          req.params.id_month,
          (result) => {
            res.status(200).json({
              data: result,
            });
          }
        );
      } catch (error) {
        next(error);
      }
    }
  );
}

module.exports = utilsApi;
