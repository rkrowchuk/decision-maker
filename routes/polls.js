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

  router.get("/results/:id", (req, res) => {
    res.locals.title = "results";
    const poll_id = req.params.id;

    return db
    .query(`SELECT polls.question, polls.answer_1, SUM(submissions.a1_score) AS a1, polls.answer_2, SUM(submissions.a2_score) AS a2, polls.answer_3, SUM(submissions.a3_score) AS a3, polls.answer_4, SUM(submissions.a4_score) AS a4
    FROM polls
    JOIN submissions ON polls.id = poll_id
    WHERE polls.id = $1
    GROUP BY polls.question, polls.answer_1, polls.answer_2, polls.answer_3, polls.answer_4;
`, [`${poll_id}`])
    .then((data) => {
      const scores = data.rows[0];
      console.log(data.rows[0]);

      const results = [];
      const ans1 = {};
      ans1.option = scores.answer_1;
      ans1.total = scores.a1;
      const ans2 = {};
      ans2.option = scores.answer_2;
      ans2.total = scores.a2;
      const ans3 = {};
      ans3.option = scores.answer_3;
      ans3.total = scores.a3;
      const ans4 = {};
      ans4.option = scores.answer_4;
      ans4.total = scores.a4;
      results.push(ans1, ans2, ans3, ans4);
      results.sort((a, b) => {
        return b.total - a.total;
      });
      const templateVars = { scores, results };
      return res.render("results", templateVars);
    })
    .catch((err) => {
      return console.log(err);
    });

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
