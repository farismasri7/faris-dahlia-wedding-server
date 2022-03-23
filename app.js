const express = require('express');
const methodOverride = require('method-override');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const expressSession = require("express-session");
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database')

const app = express();

const port = process.env.SERVER_PORT || 3000;
const session = {
    secret: config.secret,
    cookie: {},
    resave: false,
    saveUninitialized: false
};

app.use(cors());
app.use(methodOverride("_method"));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession(session));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(config.database);

mongoose.connection.on('connected', () => {
    console.log('Connected to database ' + config.database)
});

mongoose.connection.on('error', (err) => {
    console.log('Database error: ' + err)
});

const guestsController = require("./controllers/guestsController");
const adminController = require("./controllers/adminController");


require('./config/passport')(passport);
session.cookie.secure = true;


app.use('/guests', guestsController);
app.use('/admin', adminController);

const listener = () => {
    console.log(`Listening on port ${port}`);
}

app.listen(port, listener)