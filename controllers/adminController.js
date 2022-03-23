const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

const Admin = require('../models/admin');

// Create New Admin
router.post('/new', (req, res, next) => {
    let newAdmin = new Admin ({
      Username: req.body.Username,
      Password: req.body.Password,
      isAdmin: req.body.isAdmin
    });

    Admin.addAdmin(newAdmin, (err, admin) => {
        if(err) {
            res.json({success: false, msg: 'Failed to register admin'});
        } else {
            res.json({success: true, msg: 'User registered'});
        }
    })
});

// Authenticate Using Login Credentials
router.post('/authenticate', (req, res, next) => {
    const Username = req.body.Username;
    const Password = req.body.Password;
    Admin.getAdminByUsername(Username, (err, admin) => {
        if(err) throw err;
        if(!admin) {
            return res.json({Success: false, msg: 'Admin not found'});
        }

        Admin.comparePassword(Password, admin.Password, (err, isMatch) => {
            if(err) throw err;
            if(isMatch) {
                const token = jwt.sign({admin}, config.secret, {
                    expiresIn: 1800
                });

                res.json({
                    success: true,
                    token: 'JWT ' + token,
                    admin: {
                        id: admin._id,
                        Username: admin.Username,
                        Password: admin.Password,
                        isAdmin: admin.isAdmin
                    }
                });
            } else {
                return res.json({success: false, msg: 'Wrong Password'});
            }
        });
    });
});

// Get a particuler admin using a session key
router.get('/profile', passport.authenticate('jwt', { session: false}), (req, res, next) => {
    res.json({ user: req.user });
});

// Get all admins
router.get('/', (req,res) => {
    Admin.find()
    .then(result => {
        res.json(result);
    })
    .catch(err => {
        console.log(err);
    })
})

// get a specific admin by ID
router.get('/:id', (req,res) => {
    Admin.find({_id: req.params.id})
    .then(result => {
        res.json(result);
    })
    .catch(err => {
        console.log(err);
    })
})

router.put('/:id', (req,res) => {
    Admin.findById(req.params.id)
    .then(updatedAdmin => {
        updatedAdmin.set(req.body);
        updatedAdmin.save();
        res.json(updatedAdmin);
    })
    .catch(err => {
        res.json(err);
    })
})

router.delete('/:id', (req,res) => {
    Admin.findByIdAndDelete(req.params.id)
    .then(result => {
        Admin.find()
        .then(admins => {
            res.json(admins);
        })
        .catch(err => {
            res.json(err);
        })
    })
    .catch(err => {
        res.json(err);
    })
})


module.exports = router;