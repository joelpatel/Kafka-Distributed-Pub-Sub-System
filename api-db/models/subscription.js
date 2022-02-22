const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const subscriptionSchema = new Schema(
  {
    topic: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
