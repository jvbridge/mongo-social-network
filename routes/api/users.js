const router = require("express").Router();
const { User, Thought } = require("../../models");

// get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Create a new user
router.post("/", async (req, res) => {
  try {
    if (!req.body.email || !req.body.username) {
      res.status(400).json("malformed body");
      return;
    }
    const newUser = {
      email: req.body.email,
      username: req.body.username,
    };
    // check if the user's email and password are already in the database
    const usernameExists = await User.find({ username: newUser.username });
    if (usernameExists.length > 0) {
      res.status(400).json({ message: "User already exists:", usernameExists });
      return;
    }
    const emailExists = await User.find({ email: newUser.email });
    if (emailExists.length > 0) {
      res.status(400).json({ message: "User already exists:", emailExists });
      return;
    }

    // all clear lets make the user
    const newUserData = await User.create({
      ...newUser,
      friends: [],
      thoughts: [],
    });
    res.status(200).json(newUserData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get a specific user by id
router.get("/:id", async (req, res) => {
  try {
    const userData = await User.findById(req.params.id, [
      "username",
      "email",
      "createdAt",
      "friends",
      "thoughts",
    ]);
    if (!userData) {
      res.sendStatus(404);
      return;
    }

    const friendData = await User.find({ _id: userData.friends });

    const thoughtData = await Thought.find({ _id: userData.thoughts });

    const user = {
      username: userData.username,
      email: userData.email,
      createdAt: userData.createdAt,
      friends: friendData.map((friend) => {
        return {
          email: friend.email,
          username: friend.username,
          createdAt: friend.createdAt,
        };
      }),
      thoughts: thoughtData.map((thought) => {
        return {
          thoughtText: thought.thoughtText,
          createdAt: thought.createdAt,
          reactions: thought.reactions,
        };
      }),
    };
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get a specific user's friends
router.get("/:id/friends/", async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "friends");
    if (!user) {
      res.sendStatus(404);
      return;
    }
    const friends = await User.find({ _id: user.friends });
    res.status(200).json(friends);
  } catch (err) {
    res.status(500).json(err);
  }
});

// add a friend relationship
router.post("/:uid/friends/:fid", async (req, res) => {
  try {
    if (req.params.uid === req.params.fid) {
      res.status(400).json("You cannot add yourself as a friend");
      return;
    }

    const user = await User.findById(req.params.uid);
    if (!user) {
      res.status(404).json("Found no user with that id");
      return;
    }
    const friend = await User.findById(req.params.fid);
    if (!friend) {
      res.status(404).json("Found no friend to add with that id");
      return;
    }

    if (
      user.friends.includes(req.params.fid) ||
      friend.friends.includes(req.params.uid)
    ) {
      res.status(400).json("Friendship already exists");
      return;
    }
    // make sure they already have arrays in case something caused them to not
    if (!user.friends) user.friends = [];
    if (!friend.friends) friend.friends = [];

    // add both to their arrays
    user.friends.push(req.params.fid);
    friend.friends.push(req.params.uid);

    const saves = [user.save(), friend.save()];

    // do both at the same time to make transaction atomic
    await Promise.all(saves);

    // alert user that operation was successful
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a friendship
router.delete("/:uid/friends/:fid", async (req, res) => {
  try {
    if (req.params.uid === req.params.fid) {
      res.status(400).json("You cannot be friends with yourself");
      return;
    }

    const user = await User.findById(req.params.uid);
    if (!user) {
      res.status(404).json("Found no user with that id");
      return;
    }
    const friend = await User.findById(req.params.fid);
    if (!friend) {
      res.status(404).json("Found no friend to add with that id");
      return;
    }

    if (
      !user.friends.includes(req.params.fid) ||
      !friend.friends.includes(req.params.uid)
    ) {
      res.status(400).json("Friendship doesn't exist");
      return;
    }

    // filter the friend out of the arrays
    user.friends = user.friends.filter((curr) => curr != req.params.fid);
    friend.friends = friend.friends.filter((curr) => curr != req.params.uid);

    // do both at the same time to make transaction atomic
    const saves = [user.save(), friend.save()];
    await Promise.all(saves);

    // alert user that operation was successful
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.sendStatus(404);
      return;
    }

    // check body to see what to update
    if (req.body.email) {
      // check for duplicates
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        res
          .status(400)
          .json({ message: "email already exists", user: emailExists });
        return;
      }
      user.email = req.body.email;
    }

    if (req.body.username) {
      // check for duplicates
      const userExists = await User.findOne({ username: req.body.username });
      if (userExists) {
        res
          .status(400)
          .json({ message: "username already exists", user: userExists });
        return;
      }
      user.username = req.body.username;
    }

    // propogate changes
    await user.save();
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get a specific user by username
router.get("/u/:username", async (req, res) => {
  try {
    const userData = await User.findOne({ username: req.params.username }, [
      "username",
      "email",
      "createdAt",
      "friends",
      "thoughts",
    ]);
    if (!userData) {
      res.sendStatus(404);
      return;
    }
    const friendData = await User.find({ _id: userData.friends });
    const thoughtData = await Thought.find({ _id: userData.thoughts });

    const user = {
      username: userData.username,
      email: userData.email,
      createdAt: userData.createdAt,
      friends: friendData.map((friend) => {
        return {
          email: friend.email,
          username: friend.username,
          createdAt: friend.createdAt,
        };
      }),
      thoughts: thoughtData.map((thought) => {
        return {
          thoughtText: thought.thoughtText,
          createdAt: thought.createdAt,
          reactions: thought.reactions,
        };
      }),
    };
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get the friends of a username
router.get("/u/:username/friends", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      res.sendStatus(404);
      return;
    }
    const friendData = await User.find({ _id: user.friends });

    const friends = friendData.map((friend) => {
      return {
        username: friend.username,
        email: friend.email,
        createdAt: friend.createdAt,
      };
    });
    res.status(200).json(friends);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
