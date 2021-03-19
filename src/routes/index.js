const express = require('express');
const authRoute = require('./auth.route');
const twitchRoute = require('./twitch.route');
const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  }, 
  {
    path: '/twitch',
    route: twitchRoute,
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;