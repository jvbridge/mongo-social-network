const { Thought, User } = require("../models");
const mongoose = require("../config/connection");
const { getRandomUsers } = require("./data");

// the number of users for the seed data
const USER_COUNT = 50;

mongoose.on("error", (err) => err);

mongoose.once("open", async () => {
  // empty the whole database to start off
  await Thought.deleteMany({});
  await User.deleteMany({});

  // get a bunch of random unique users
  const users = getRandomUsers(USER_COUNT);
  console.table(users);
  await User.collection.insertMany(users);

  process.exit(0);
});
