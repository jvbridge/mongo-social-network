const router = require("express").Router();
const { User, Thought } = require("../../models");
const ObjectId = require("mongoose").Types.ObjectId;

router.get("/", async (req, res) => {
  try {
    const thoughts = await Thought.find({});
    res.status(200).json(thoughts);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/", async (req, res) => {
  try {
    const newThought = {
      _id: new ObjectId(),
      thoughtText: req.body.thoughtText,
      username: req.body.username,
    };
    if (!newThought.thoughtText || !newThought.username) {
      res.status(400).json("malformed body");
      return;
    }

    const user = await User.findOne({ username: newThought.username });
    if (!user) {
      res.status(404).json("no username found for ", newThought.username);
      return;
    }

    // if the user doesn't have a thought array, give them one
    if (!user.thoughts) {
      user.thoughts = [];
    }

    // now we can save our thoughts
    user.thoughts.push(newThought._id);
    const promises = [user.save(), Thought.create({ ...newThought })];
    // make the transaction atomic
    await Promise.all(promises);
    // all done, lets let the user know
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const thought = await Thought.findById(req.params.id);
    if (!thought) {
      res.sendStatus(404);
      return;
    }
    res.status(200).json(thought);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id/reactions", async (req, res) => {
  try {
    const thought = await Thought.findById(req.params.id);
    if (!thought) {
      res.sendStatus(404);
      return;
    }
    res.status(200).json(thought.reactions);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
