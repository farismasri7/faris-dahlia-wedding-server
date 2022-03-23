const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../config/database');

const adminSchema = new mongoose.Schema(
    {
        Username: String,
        Password: String,
        isAdmin: Boolean,
    }
);

const Admin = module.exports = mongoose.model('Admin', adminSchema);

module.exports.getAdminById = function(id, callback){
    Admin.findById(id, callback)
}

module.exports.getAdminByUsername = function(Username, callback){
    const query = {Username: Username}
    Admin.findOne(query, callback)
}

module.exports.addAdmin = function(newUser, callback){
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.Password, salt, (err, hash) => {
            if(err) throw err;
            newUser.Password = hash;
            newUser.save(callback);
        });
    });
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if(err) throw err;
        callback(null, isMatch);
    });
}
