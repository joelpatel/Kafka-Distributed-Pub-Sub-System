const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const topicSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: false,
  },
});

module.exports = mongoose.model("Topic", topicSchema);
