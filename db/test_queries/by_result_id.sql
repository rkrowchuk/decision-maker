SELECT polls.question, polls.answer_1, SUM(submissions.a1_score) AS a1, polls.answer_2, SUM(submissions.a2_score) AS a2, polls.answer_3, SUM(submissions.a3_score) AS a3, polls.answer_4, SUM(submissions.a4_score) AS a4
    FROM polls
    JOIN submissions ON polls.id = poll_id
    WHERE polls.result_url = '54emw'
    GROUP BY polls.question, polls.answer_1, polls.answer_2, polls.answer_3, polls.answer_4;
