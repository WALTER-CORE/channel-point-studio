const express = require('express');
const authRoute = require('./auth.route');
const twitchRoute = require('./twitch.route');
const rewardRoute = require('./rewards.route');
const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  }, 
  {
    path: '/twitch',
    route: twitchRoute,
  },
  {
    path: '/rewards',
    route: rewardRoute,
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;