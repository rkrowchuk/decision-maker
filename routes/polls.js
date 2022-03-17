/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */
const { Template } = require("ejs");
const express = require("express");
const router = express.Router();
const querystring = require('querystring');
const { generateRandomString } = require("../helpers/helpers.js");

//mailgun
const mailgun = require("mailgun-js");
const api_key = process.env.MAILGUN_API_KEY;
const DOMAIN = 'sandbox37b93d4a24df42e68f97f1f1461200de.mailgun.org';
const mg = mailgun({apiKey: api_key, domain: DOMAIN});

module.exports = (db) => {

  router.get("/vote/:id", (req, res) => {
    res.locals.title = "voting";
    const vote_url = req.params.id;

    return db
      .query("SELECT * FROM polls WHERE submission_url = $1;", [`${vote_url}`])
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
    const poll_url = req.params.id;

    return db
    .query(`SELECT polls.question, polls.answer_1, SUM(submissions.a1_score) AS a1, polls.answer_2, SUM(submissions.a2_score) AS a2, polls.answer_3, SUM(submissions.a3_score) AS a3, polls.answer_4, SUM(submissions.a4_score) AS a4
    FROM polls
    JOIN submissions ON polls.id = poll_id
    WHERE polls.result_url = $1
    GROUP BY polls.question, polls.answer_1, polls.answer_2, polls.answer_3, polls.answer_4;
`, [`${poll_url}`])
    .then((data) => {
      const scores = data.rows[0];

      // Redirect if poll has no votes yet.
      if(!scores) {
        const query = querystring.stringify({
          "msg": "No results for this poll yet!"
        });
        return res.redirect('/?' + query);
      }

      // console.log(data.rows[0]);

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

      // Calculate percentages
      let sum = 0;
      for (const opt of results) {
        sum += parseInt(opt.total);
      };
      const percentages = [];
      for (const opt of results) {
        percentages.push(parseFloat((opt.total / sum) * 100).toFixed(1));
      };


      const templateVars = { scores, results, percentages };
      return res.render("results", templateVars);
    })
    .catch((err) => {
      return console.log('error here!!!!!::', err);
    });

  });

  router.get("/success", (req, res) => {
    res.locals.title = "success";
    console.log("req.query", req.query);
    // const templateVars = {submissionUrl: req.query.submissionUrl, resultUrl: req.query.resultUrl};
    res.render("success", req.query);

  });

  router.post("/", (req, res) => {
    const pollInput = req.body;
    const resultUrl = generateRandomString();
    const submissionUrl = generateRandomString();
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
      `${resultUrl}`,
      `${submissionUrl}`,
    ];

    queryParams.push(pollInput.include_name ? 'true' : 'false');

    const base_url = process.env.BASE_URL || 'http://localhost:8080/';

    const data = {
      from: 'Excited User <decisions.lhl@gmail.com>',
      to: 'decisions.lhl@gmail.com',
      subject: 'You have created a new poll!',
      html: `
      <div style="background: linear-gradient(to right, #6a11cb 0%, #2575fc 100%); padding: 25px">
      <h1 style="color:#edf5e1; text-align: center"><a href="${base_url}api/polls/vote/${submissionUrl}" style="color:#6cdaee">Share with your friends</a></h1> <h1 style="color:#edf5e1; text-align: center"><a href="${base_url}api/polls/results/${resultUrl}" style="color:#6cdaee">View your results</a></h1>
      </div>`
    };

    return db
      .query(
        `INSERT INTO polls (question, answer_1, description_1, answer_2, description_2, answer_3, description_3, answer_4, description_4, creator_email, result_url, submission_url, name_required) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        queryParams
      )
      .then((result) => {
        mg.messages().send(data, function (error, body) {
          if (error) {
            console.log(error);
          }
          console.log(body);
        })
        const query = querystring.stringify({
          submissionUrl,
          resultUrl
        });
        return res.redirect("/api/polls/success?" + query);
      })
      .catch((err) => {
         return console.log("error:", err);
      });
  });

  router.post("/:id", (req, res) => {
    const voteInput = req.body;
    const queryParams = [
      `${voteInput.poll_id}`,
      `${voteInput.voter_name}`,
      `${voteInput.option_1}`,
      `${voteInput.option_2}`,
      `${voteInput.option_3}`,
      `${voteInput.option_4}`,
    ];

    let emailName;
      if (!voteInput.voter_name) {
        emailName = "An anonymous voter";
      } else {
        emailName = voteInput.voter_name;
      }

    const queryString = `INSERT INTO submissions (
      poll_id, voter_name, a1_score, a2_score, a3_score, a4_score
    ) VALUES (
      $1, $2, $3, $4, $5, $6
    );`

    return db.query(`SELECT question, result_url FROM polls WHERE id = ${voteInput.poll_id}`)
    .then((result) => {
      const base_url = process.env.BASE_URL || 'http://localhost:8080/';
      const data = {
        from: 'Excited User <decisions.lhl@gmail.com>',
        to: 'decisions.lhl@gmail.com',
        subject: 'Someone has voted!🎉',
        html: `
        <div style="background: linear-gradient(to right, #6a11cb 0%, #2575fc 100%); padding: 25px">
        <h1 style="color:#edf5e1; text-align: center">${emailName} has voted on your poll: ${result.rows[0].question} </h1>
        <h1 style="text-align: center"><a href="${base_url}api/polls/results/${result.rows[0]['result_url']}" style="color:#6cdaee">View your results</a></h1>
        </div>`
      };
      return db.query(queryString, queryParams)
      .then(() => {
        const query = querystring.stringify({
          "voted": true,
          "voter_name": voteInput.voter_name,
        });
       return res.redirect('/?' + query);
      })
      .then(() => {
        mg.messages().send(data, function (error, body) {
          if (error) {
            console.log(error);
          }
          console.log(body);
        })
      })
      .catch((err) => {
        return console.log(err);
      })
    })
  });

  return router;
};
