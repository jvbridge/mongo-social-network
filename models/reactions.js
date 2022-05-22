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
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    get: getTimestamp,
  },
});

module.exports = reactionSchema;
