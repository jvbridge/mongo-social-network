const router = require("express").Router();
const { User, Thought } = require("../../models");

router.get("/", async (req, res) => {
  try {
    const thoughts = await Thought.find({});
    res.status(200).json(thoughts);
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
