const { Thought, User } = require("../models");
const db = require("../config/connection");
const { getRandomUsers } = require("./data");
const ObjectId = require("mongoose").Types.ObjectId;

// number of users we will generate
const USER_COUNT = 50;
// the minimum number of friends they will have, must be less than MAX_FRIENDS
const MIN_FRIENDS = 5;
// maximum number of friends, must be less than MIN_FRIENDS and USER_COUNT
const MAX_FRIENDS = 20;

// error handling
db.on("error", (err) => err);

// doing the seeding
db.once("open", async () => {
  // empty the whole database to start off
  await Thought.deleteMany({});
  await User.deleteMany({});

  // get a bunch of random unique users
  const users = getRandomUsers(USER_COUNT);
  console.table(users);
  await User.collection.insertMany(users);

  // lets give them all friends now
  // get references to them in the table
  const allUsers = await User.find({});
  // array to hold our promises for when we update each user
  const friendPromises = [];

  // loop to give every user frineds
  allUsers.forEach(async (user) => {
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

  // we are now finished, exit node
  process.exit(0);
});
