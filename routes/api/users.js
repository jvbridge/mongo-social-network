const router = require("express").Router();
const { User, Thought } = require("../../models");

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
    let userData = await User.findById(req.params.id, [
      "username",
      "email",
      "createdAt",
      "friends",
    ]);
    if (!userData) {
      res.sendStatus(404);
      return;
    }

    const friendData = await User.find({ _id: userData.friends }, [
      "username",
      "email",
      "createdAt",
    ]);
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
    };
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
