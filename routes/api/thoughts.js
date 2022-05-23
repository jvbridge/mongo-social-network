const router = require("express").Router();
const { User, Thought } = require("../../models");
const ObjectId = require("mongoose").Types.ObjectId;

// get all thoughts
router.get("/", async (req, res) => {
  try {
    const thoughts = await Thought.find({});
    res.status(200).json(thoughts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// make a new thought
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

    if (newThought.thoughtText.length > 280) {
      res.status(400).json("Thought text too long");
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

// get a single thought
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

// update a single thought
router.put("/:id", async (req, res) => {
  try {
    const thought = await Thought.findById(req.params.id);
    if (!thought) {
      res.sendStatus(404);
      return;
    }
    if (!req.body.thoughtText) {
      res.status(400).json("missing body update text");
      return;
    }

    thought.thoughtText = req.body.thoughtText;
    await thought.save();

    res.sendStatus(200);
  } catch (err) {
    res.status(500).json(err);
  }
});

// delete a single thought
router.delete("/:id", async (req, res) => {
  try {
    const thought = await Thought.findById(req.params.id);
    if (!thought) {
      res.sendStatus(404);
      return;
    }

    await thought.delete();
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get a thought's reactions
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

// add a new reaction to the post
router.post("/:id/reactions", async (req, res) => {
  try {
    const thought = await Thought.findById(req.params.id);
    if (!thought) {
      res.sendStatus(404);
      return;
    }
    const reactionId = new ObjectId();
    const newReaction = {
      reactionBody: req.body.reactionBody,
      username: req.body.username,
      reactionId,
    };

    // validate reaction
    const user = await User.findOne({ username: newReaction.username });
    if (!user) {
      res.status(404).json(`User ${newReaction.username} does not exist`);
      return;
    }
    thought.reactions.push(newReaction);
    await thought.save();
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json(err);
  }
});

// delete a reaction
router.delete("/:tid/reactions/:rid", async (req, res) => {
  try {
    // find the thought
    const thought = await Thought.findById(req.params.tid);
    if (!thought) {
      res.status(404).json("thought with that id not found");
      return;
    }

    // find the reaction
    const reaction = thought.reactions.find(
      (element) => element.reactionId == req.params.rid
    );

    if (!reaction) {
      res.status(404).json("reaction with that ID not found");
      return;
    }

    // remove the reaction from the thoughts
    thought.reactions = thought.reactions.filter(
      (element) => element.reactionId != req.params.rid
    );
    await thought.save();
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
