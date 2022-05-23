const mongoose = require("mongoose");
const { getTimestamp, setTimestamp } = require("../util/helpers");
const reactionSchema = require("./reactions");

const thoughtSchema = new mongoose.Schema(
  {
    thoughtText: {
      type: String,
      unique: false,
      required: true,
      minlength: 1,
      maxlength: 280,
    },
    createdAt: {
      type: Date,
      default: setTimestamp,
      get: getTimestamp,
    },
    username: {
      type: String,
      required: true,
    },
    reactions: [reactionSchema],
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

thoughtSchema.virtual("reactionCount").get(function () {
  return this.reactions.length;
});

const Thought = mongoose.model("Thought", thoughtSchema);
module.exports = Thought;
