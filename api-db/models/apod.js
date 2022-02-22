const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const apodSchema = new Schema(
    {
        date: {
            type: String
        },
        title: {
            type: String
        },
        url: {
            type: String
        }
    }
)

module.exports = mongoose.model("APOD", apodSchema);