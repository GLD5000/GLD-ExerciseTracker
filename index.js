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

const ExerciseLog = mongoose.model("ExerciseLog", exerciseLogSchema);
const User = mongoose.model("User", userSchema);

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
app.post("/api/users", (req, res) => {
  const input = req.body.username;
  const newUser = new User({ username: input });
  newUser
    .save()
    .then((savedUser) => {
      res.json({
        username: savedUser.username,
        _id: savedUser._id,
      });

      console.log("User saved successfully.");
    })
    .catch((error) => {
      console.error("Error saving user:", error);
    });
});

app.post("/api/users/:_id/exercises", (req, res) => {
  // Date is optional
  // If date is missing today's date is used
  const userId = req.params._id;
  const { description, duration, date } = req.body;
  console.log("date:", date);
  User.findById(userId)
    .exec()
    .then((user) => {
      if (!user) {
        throw new Error("User not found");
      }

      // Create a new exercise log with today's date
      const exerciseLog = {
        description: description,
        duration: duration,
        date: date ? new Date(date) : new Date(),
      };

      // Add the exercise log to the user's log array
      user.logs.push(exerciseLog);

      // Save the updated user object
      return user.save();
    })
    .then((user) => {
      res.json({
        username: user.username,
        // logs: user.logs,
        description: description,
        duration: duration,
        date: new Date(date).toDateString(),
        _id: userId,
      });

      console.log("Exercise added to user log successfully.");
    })
    .catch((error) => {
      console.error("Error adding exercise to user log:", error);
    });
});

app.get("/api/users", (req, res) => {
  User.find({})
    .select("-logs")
    .exec()
    .then((users) => {
      console.log("Users:", users);
      res.json(users);
    })
    .catch((error) => {
      console.error("Error fetching users:", error);
    });
});

app.get("/api/users/:_id/logs", (req, res) => {
  // If query is blank, return all exercises for the user
  const userId = req.params._id;
  const queryFrom = req.query.from; // yyyy-mm-dd
  const queryTo = req.query.to; // yyyy-mm-dd
  const queryLimit = req.query.limit;
  const queryEmpty =
    queryFrom === undefined ||
    queryTo === undefined ||
    queryLimit === undefined;
  if (queryEmpty) {
    User.findById(userId)
      .exec()
      .then((user) => {
        if (!user) {
          throw new Error("User not found");
        }

        const exerciseLogs = user.logs.map((log) => {
          return {
            description: `${log.description}`,
            duration: log.duration,
            date: log.date.toDateString(),
          };
      });
        console.log("Exercise logs for user:", exerciseLogs);
        return res.json({
          username: user.username,
          count: `${exerciseLogs.length}`,
          _id: userId,
          log: exerciseLogs,
        });
      })
      .catch((error) => {
        console.error("Error fetching exercise logs:", error);
      });
  } else {
    const fromDate = new Date(queryFrom); // yyyy-mm-dd
    const toDate = new Date(queryTo); // yyyy-mm-dd
    const limit = Number(queryLimit);

    console.log(
      "query",
      JSON.stringify({
        query: {
          from: fromDate,
          to: toDate,
          limit: limit,
        },
      })
    );
    const returnObject = { _id: userId };
    // User.findById(userId)
    //   .exec()
    //   .then((user) => {
    //     if (!user) {
    //       throw new Error("User not found");
    //     }
    //     returnObject.username = user.name
    //     return ExerciseLog.find({ User: userId })
    //       .where("date")
    //       .gte(fromDate)
    //       .lte(toDate)
    //       .limit(limit)
    //       .exec();
    //   })
    //   .then((logs) => {
    //     console.log("Exercise logs:", logs);
    //     res.json({...returnObject,
    //       count: logs.length,
    //       log: logs.map((x) => {
    //         x.date = x.date.toDateString();
    //         console.log('x:', x);
    //         return x;
    //       }),
    //     });
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching exercise logs:", error);
    //   });
    User.findById(userId)
      .exec()
      .then((user) => {
        if (!user) {
          throw new Error("User not found");
        }

        const logs = user.logs
          .filter((log) => log.date >= fromDate && log.date <= toDate)
          .slice(0, limit);

        // console.log("Exercise logs:", logs);
        res.json({
          username: user.username,
          count: `${logs.length}`,
          log: logs.map((log) => {
            return {
              description: `${log.description}`,
              duration: log.duration,
              date: log.date.toDateString(),
            };
          }),
        });
      })
      .catch((error) => {
        console.error("Error fetching exercise logs:", error);
      });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
