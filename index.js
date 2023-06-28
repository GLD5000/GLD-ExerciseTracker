const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
app.post("/api/users", (req, res) => {
  const input = req.body.username;
  res.json({
    username: input,
    _id: "resultant ID",
  });
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const uid = req.params._id;
  const { description, duration, date } = req.body;
  res.json({
    username: "fcc_test",
    description: description,
    duration: duration,
    date: date,
    _id: uid,
  });
});

app.get("/api/users/:_id/logs", (req, res) => {
  const uid = req.params._id;
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;
  console.log("query", JSON.stringify({query: {
    from: from,
    to: to,
    limit: limit
  }}))
  res.json({
    username: uid,
    count: 1,
    _id: "5fb5853f734231456ccb3b05",
    log: [
      {
        description: "test",
        duration: 60,
        date: "Mon Jan 01 1990",
      },
    ],
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
