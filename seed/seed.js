const { Thought, User } = require("../models");
const db = require("../config/connection");
const { getRandomUsers } = require("./data");
const ObjectId = require("mongoose").Types.ObjectId;
const tweets = require("./tweets.json");
const emoji = require("./emoji.json");

// number of users we will generate
const USER_COUNT = 50;
// the minimum number of friends they will have, must be less than MAX_FRIENDS
const MIN_FRIENDS = 5;
/**
 * The maximum number of friends
 */
const MAX_FRIENDS = 20;
// minimum number of thoughts or "comments" each user is able to create
const MIN_THOUGHTS = 5;

/**
 * Helper function that creates all the users we need
 */
const createUsers = async () => {
  const users = getRandomUsers(USER_COUNT);
  console.table(users);
  await User.collection.insertMany(users);
};

/**
 * Helper function to create all the friends of the users in question.
 */
const addFrineds = async () => {
  // get references to all users in the database
  const allUsers = await User.find({});
  // make all the users have empty friends arrays
  allUsers.forEach((user) => {
    user.frineds = [];
  });

  // iterating over all the users figuring out which friends to add
  allUsers.forEach((user) => {
    // the number of friends they're going to have
    const friendCount = Math.floor(Math.random() * MAX_FRIENDS) + MIN_FRIENDS;
    // make a list of friends to add
    const toAdd = [];
    for (let i = 0; i < friendCount; i++) {
      // choose a random user to be their friend
      const newFriend = allUsers[Math.floor(Math.random() * allUsers.length)];
      // stops duplicates and adding yourself
      if (toAdd.includes(newFriend) || user == newFriend) {
        i--;
        continue;
      }
      toAdd.push(newFriend);
    }
    // populate the arrays for each friends
    toAdd.forEach((friend) => {
      // if we already are friends, skip it
      if (user.friends.includes(friend.id)) return;
      // otherwise add to each array
      friend.frineds.push(user.id);
      user.friends.push(friend.id);
    });
  });
  // array to hold our promises for when we update each user
  const friendPromises = allUsers.map((user) => user.save());
  // then execute the save
  await Promise.all(friendPromises);
};

/**
 * helper function to create all the thoughts for all users
 */
const createThoughts = async () => {
  // get all the users
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
  // setup complete, this executes the data insertion and updates
  await Promise.all(thoughtPromises);
};

/**
 * helper function to create all the reactions
 */
const createReactions = async () => {
  console.log("Creating reactions, this takes a second");
  // get all the users
  const allUsers = await User.find({});
  const promises = [];
  // iterate over all users to add reactions on their posts.

  for (let i = 0; i < allUsers.length; i++) {
    const user = allUsers[i];
    // get references to theeir friends and thoughts
    const friends = await User.find({ _id: user.friends });
    const thoughts = await Thought.find({
      username: allUsers[i].username,
    });

    thoughts.forEach((thought) => {
      // we will have a random number of reactions based on how many friends
      const reactionCount = Math.floor(Math.random() * user.friends.length);
      // create all the reactions we want
      const reactions = [];
      for (let i = 0; i < reactionCount; i++) {
        // id
        const reactionId = new ObjectId();
        // random reaction
        const reactionBody = emoji[Math.floor(Math.random() * emoji.length)];
        // get a random friend to have the username
        const username =
          friends[Math.floor(Math.random() * friends.length)].username;
        const createdAt = Date.now();
        const reaction = { reactionId, reactionBody, username, createdAt };
        // add it to the array
        reactions.push(reaction);
      }
      // make the reactions a part of the array
      thought.reactions = reactions;
      // save it and push the promise to an array for later execution
      promises.push(thought.save());
    });
  }
  // we've set up all the reactions, now we need to save them
  await Promise.all(promises);
  console.log("Done with reactions");
};

// error handling
db.on("error", (err) => err);

// doing the seeding
db.once("open", async () => {
  // empty the whole database to start off
  await Thought.deleteMany({});
  await User.deleteMany({});

  // helper function to create all the users
  await createUsers();

  // helper function to create all the friend relationships
  await addFrineds();

  // helper function to create all the thoughts for the posts
  await createThoughts();

  // helper function to create all the reactions
  await createReactions();
  console.log("Seeding complete");
  // we are now finished, exit node
  process.exit(0);
});
