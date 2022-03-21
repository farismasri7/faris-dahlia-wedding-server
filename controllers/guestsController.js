const express = require('express');
const router = express.Router();

const Guest = require("../models/guest");

router.get('/', (req, res) => {
    Guest.find()
        .then((guests) => {
            res.json(guests);
        })
        .catch((err) => {
            res.json(err);
        });
});

router.post('/', (req, res) => {
    Guest.create(req.body)
        .then((newGuest) => {
            res.redirect("http://localhost:3000/guests")
        })
        .catch((err) => {
            res.json(err);
        });
});

router.delete('/:id', (req, res) => {
    Guest.findByIdAndDelete(req.params.id)
        .then(() => {
            Guest.find()
                .then(guests => {
                    res.json(guests);
                });
        })
        .catch((err) => {
            res.json(err);
        });
});

module.exports = router;