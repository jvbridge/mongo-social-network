const { Thought, User } = require("../models");
const db = require("../config/connection");
const { getRandomUsers } = require("./data");
const ObjectId = require("mongoose").Types.ObjectId;
const tweets = require("./tweets.json");

// number of users we will generate
const USER_COUNT = 50;
// the minimum number of friends they will have, must be less than MAX_FRIENDS
const MIN_FRIENDS = 5;
// maximum number of friends, must be > MIN_FRIENDS and < USER_COUNT
const MAX_FRIENDS = 20;
// minimum number of thoughts or "comments" each user is able to create
const MIN_THOUGHTS = 5;

// error handling
db.on("error", (err) => err);

// doing the seeding
db.once("open", async () => {
  // empty the whole database to start off
  await Thought.deleteMany({});
  await User.deleteMany({});

  // CREATE USERS

  // get a bunch of random unique users
  const users = getRandomUsers(USER_COUNT);
  console.table(users);
  await User.collection.insertMany(users);

  // ADD FRIENDS

  // lets give them all friends now
  // get references to them in the table
  const allUsers = await User.find({});
  // array to hold our promises for when we update each user
  const friendPromises = [];

  // loop to give every user frineds
  allUsers.forEach((user) => {
    // random number for how many friends they have
    const friendCount = Math.floor(Math.random() * MAX_FRIENDS) + MIN_FRIENDS;

    // make an array of friends to add
    const friendArr = [];
    // populate it with references
    for (let i = 0; i < friendCount; i++) {
      const newFriend = allUsers[Math.floor(Math.random() * allUsers.length)];
      // if it's not a valid friend try again
      if (friendArr.includes(newFriend) || user == newFriend) {
        i--;
        continue;
      }
      // otherwise add it
      friendArr.push(newFriend);
    }

    // add the whole new array and save it
    const friendIds = friendArr.map((friend) => {
      const id = new ObjectId(friend._id);
      return id;
    });
    // add it to the promise array
    friendPromises.push(
      User.findOneAndUpdate({ _id: user._id }, { friends: friendIds })
    );
  });
  // we finished setting up our updates, this puts them through
  await Promise.all(friendPromises);

  // CREATE THOUGHTS

  // we need to get all our users again because the old array is out of date now
  const allFriends = await User.find({});

  // array for holding the promises of all the thoughts we will make.
  const thoughtPromises = [];
  allFriends.forEach((user) => {
    // how many thoughts we can create will be randomly chosen
    const thoughtCount =
      Math.floor(Math.random() * (tweets.length - MIN_THOUGHTS)) + MIN_THOUGHTS;

    // array for our thought strings
    const thoughtStrings = [];
    for (let i = 0; i < thoughtCount; i++) {
      const newThought = tweets[Math.floor(Math.random() * tweets.length)];
      // if we accidentally chose one we already are using, try again
      if (thoughtStrings.includes(newThought)) {
        i--;
        continue;
      }
      thoughtStrings.push(newThought);
    }

    // an array to hold the Ids of the thoughts for updating the user
    const thoughtIds = [];
    // turn the thoughts into objects for insertion
    const thoughtObjs = thoughtStrings.map((thoughtText) => {
      // assign the ID here so we can properly update the user
      const thoughtId = new ObjectId();
      thoughtIds.push(thoughtId);
      return { thoughtText, username: user.username, _id: thoughtId };
    });

    // we've chosen our strings, lets set up the data insertion
    thoughtPromises.push(Thought.collection.insertMany(thoughtObjs));
    // updates the user as well
    thoughtPromises.push(
      User.findOneAndUpdate({ _id: user.id }, { thoughts: thoughtIds })
    );
  });
  // setup complete, this executes the data insertion and update
  await Promise.all(thoughtPromises);

  // we are now finished, exit node
  process.exit(0);
});
