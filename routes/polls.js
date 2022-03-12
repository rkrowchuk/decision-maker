/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const { Template } = require("ejs");
const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.get("/", (req, res) => {
    res.locals.title = "new route";
    res.render("index");
  });

  router.get("/:id", (req, res) => {
    res.locals.title = "voting";
    const poll_id = req.params.id;

    db.query('SELECT * FROM polls WHERE id = $1;', [poll_id])
      .then((res) => {
        const poll = res.rows[0];
        const templateVars = { poll };
        return res.render("voting", templateVars);
      })
      .catch((err) => {
        console.log(err);
      });
  });

  router.get("/results", (req, res) => {
    res.locals.title = "results";
    res.render("results");
  });

  router.get("/success", (req, res) => {
    res.locals.title = "success";
    res.render("success");
  });

  return router;
};
