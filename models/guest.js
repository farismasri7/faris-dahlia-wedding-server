const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema(
    {
        FirstName: String,
        LastName: String,
        Email: String,
        isAttending: String
    }
);

const Guest = mongoose.model("Guest", guestSchema);

module.exports = Guest;