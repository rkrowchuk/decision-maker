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

  router.get("/vote/:id", (req, res) => {
    res.locals.title = "voting";
    const poll_id = req.params.id;

    return db
      .query("SELECT * FROM polls WHERE id = $1;", [`${poll_id}`])
      .then((data) => {
        const poll = data.rows[0];
        const templateVars = { poll };
        return res.render("voting", templateVars);
      })
      .catch((err) => {
        return console.log(err);
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

  router.post("/", (req, res) => {
    const pollInput = req.body;
    const queryParams = [
      `${pollInput.question}`,
      `${pollInput.answer1}`,
      `${pollInput.description_1}`,
      `${pollInput.answer2}`,
      `${pollInput.description_2}`,
      `${pollInput.answer3}`,
      `${pollInput.description_3}`,
      `${pollInput.answer4}`,
      `${pollInput.description_4}`,
      `${pollInput.email}`,
    ];
    return db
      .query(
        `INSERT INTO polls (question, answer_1, description_1, answer_2, description_2, answer_3, description_3, answer_4, description_4, creator_email) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        queryParams
      )
      .then((result) => {
        return res.redirect("/api/polls/success");
      })
      .catch((err) => {
         return console.log("error:", err);
      });
  });

  router.post("/:id", (req, res) => {
    res.redirect("/");
  });

  return router;
};
