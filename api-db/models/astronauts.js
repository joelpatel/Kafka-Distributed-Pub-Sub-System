const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const astronautsSchema = new Schema(
    {
        number: {
            type: Number
        },
        people: [{
            craft: String,
            name: String
        }]
    }
)

module.exports = mongoose.model("Astronauts", astronautsSchema);