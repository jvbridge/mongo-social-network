const mongoose = require("mongoose");
const { getTimestamp } = require("../util/helpers");

const thoughtSchema = new mongoose.Schema({
  thoughtText: {
    type: String,
    unique: false,
    required: true,
    minlength: 1,
    maxlength: 280,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: getTimestamp,
  },
  // TODO: username relationship
  // username: {
  //   type: String,
  //   required: true,
  // },
  // reactions: {
  //   // Array of nested documents created with the reaction schema
  // },
});

// TODO: reaction count virtual that retrieves the length of the throught's
// reactions whatever that is
const Thought = mongoose.model("Thought", thoughtSchema);
module.exports = Thought;
