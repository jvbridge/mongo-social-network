const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const { getTimestamp } = require("../util/helpers");

const reactionSchema = new mongoose.Schema({
  // reaction stuff!
  reactionId: {
    type: ObjectId,
    default: new ObjectId(),
  },
  reactionBody: {
    type: String,
    required: true,
    maxlength: 280,
  },
  username: {
    // TODO: define relationship
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: getTimestamp,
  },
});

const Reaction = mongoose.model("Reaction", reactionSchema);
module.exports = Reaction;
