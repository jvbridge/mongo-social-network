const router = require("express").Router();
const apiRoutes = require("./api");

router.use("/api", apiRoutes);
// helper for when we get to the last endpoint
router.use((req, res) => res.send("Invalid route!"));

module.exports = router;
