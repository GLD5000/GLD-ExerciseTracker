const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

//Mongoose Configuration
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const exerciseLogSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, required: true },
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  logs: [exerciseLogSchema],
});

const ExerciseLog = mongoose.model('ExerciseLog', exerciseLogSchema);
const User = mongoose.model("User", userSchema);


app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
app.post("/api/users", (req, res) => {
  const input = req.body.username;
  const newUser = new User({username: input});
  newUser.save()
  .then((savedUser) => {
    
    res.json({
      username: savedUser.username,
      _id: savedUser._id,
    });
  
    console.log('User saved successfully.');
  })
  .catch((error) => {
    console.error('Error saving user:', error);
  });

});

app.post("/api/users/:_id/exercises", (req, res) => {
  // Date is optional
  // If date is missing today's date is used
  const uid = req.params._id;
  const { description, duration, date } = req.body;

  User.findById(uid)
  .exec()
  .then((user) => {
    if (!user) {
      throw new Error('User not found');
    }

    // Create a new exercise log with today's date
    const exerciseLog = {
      description: description,
      duration: duration,
      date: date? new Date(date): new Date(),
    };

    // Add the exercise log to the user's log array
    user.logs.push(exerciseLog);

    // Save the updated user object
    return user.save();

  })
  .then((user) => {
    res.json({
      username: user.username,
      description: description,
      duration: duration,
      date: date,
      _id: uid,
    });
  
    console.log('Exercise added to user log successfully.');
  })
  .catch((error) => {
    console.error('Error adding exercise to user log:', error);
  });


});

app.get("/api/users", (req, res) => {
  res.json([{user:"user", _id: "idisodisodisod"}, {user2: "useiruiruriu", _id: "idisodisodisod"}] );
});

app.get("/api/users/:_id/logs", (req, res) => {

  // If query is blank, return all exercises for the user
  const uid = req.params._id;
  const from = req.query.from;// yyyy-mm-dd
  const to = req.query.to;// yyyy-mm-dd
  const limit = req.query.limit;
  console.log(
    "query",
    JSON.stringify({
      query: {
        from: from,
        to: to,
        limit: limit,
      },
    })
  );
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
