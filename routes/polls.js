/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", (req, res) => {
    res.locals.title = "new route";
    res.render("index");
  });

  router.get("/id", (req, res) => {
    res.locals.title = "voting";
    res.render("voting");
  });

  router.get("/results", (req, res) => {
    res.locals.title = "results";
    res.render("results");
  });

  return router;
};
