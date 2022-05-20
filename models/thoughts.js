const mongoose = require("mongoose");

// getter function for timestamp
// TODO: test
const dateGetter = (date) => {
  if (date) return date.toISOString().split("T")[0];
};

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
    get: dateGetter,
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

const Thought = mongoose.model("Thought", thoughtSchema);
module.exports = Thought;
