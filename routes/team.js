const express = require('express');
const passport = require('passport');
const TeamService = require('../services/team');
const { params } = require('../utils/params');

//JWT strategy
require('../utils/auth/jwt');

function utilsApi(app) {
  const router = express.Router();
  app.use(`${params.urlAPi}api/team`, router);
  const teamService = new TeamService();

  router.get(
    '/listuserteam',
    passport.authenticate('jwt', { session: false }),
    async function (req, res, next) {
      try {
        await teamService.listUserTeam(
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
    '/listConfiguration',
    passport.authenticate('jwt', { session: false }),
    async function (req, res, next) {
      try {
        await teamService.listConfiguration(
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

  router.post(
    '/listplayers',
    passport.authenticate('jwt', { session: false }),
    async function (req, res, next) {
      const { body: listFilter } = req;
      try {
        await teamService.listPlayers(
          listFilter,
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

  router.post(
    '/getUpdatedTeam',
    passport.authenticate('jwt', { session: false }),
    async function (req, res, next) {
      const { body: listFilter } = req;
      try {
        await teamService.listUpdatedTeam(
          listFilter,
          (result) => {
            console.log('devolucion despues de ejecucion');
            console.log('result', result);
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

  router.post(
    '/savePlayer',
    passport.authenticate('jwt', { session: false }),
    async function (req, res, next) {
      const { body: players } = req;
      try {
        await teamService.savePlayers(players, (result) => {
          res.status(200).json({
            data: result,
            //message: 'user created',
          });
        });
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    '/saveConfiguration',
    passport.authenticate('jwt', { session: false }),
    async function (req, res, next) {
      const { body: players } = req;
      try {
        await teamService.saveConfiguration(players, (result) => {
          res.status(200).json({
            data: result[0],
            //message: 'user created',
          });
        });
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    '/saveFechaSincronizacion',
    passport.authenticate('jwt', { session: false }),
    async function (req, res, next) {
      // const { body: players } = req;
      try {
        await teamService.saveFechaSincronizacion((result) => {
          res.status(200).json({
            data: result[0],
            //message: 'user created',
          });
        });
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    '/listFechaSincronizacion',
    passport.authenticate('jwt', { session: false }),
    async function (req, res, next) {
      try {
        await teamService.listFechaSincronizacion(
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
