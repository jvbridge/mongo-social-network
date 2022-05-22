const router = require("express").Router();
const { User } = require("../../models");

router.get("/", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.find({ _id: req.params.id });
    user ? res.status(200).json(user) : res.sendStatus(404);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
