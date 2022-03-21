const { urlencoded } = require('body-parser');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const app = express();
const port = process.env.SERVER_PORT || 3000;

// Apply CORS to all routes
app.use(cors());
app.use(methodOverride("_method"));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});


mongoose.connect('mongodb://localhost/guestdb', {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
}, err => {
    if(err) throw err;
    console.log('Connected to MongoDB!!!')
});

// mongoose.connect('mongodb://docker.for.mac.host.internal:27017/storedb', {
//     useNewUrlParser: true, 
//     useUnifiedTopology: true, 
//     useCreateIndex: true
// });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const guestsController = require("./controllers/guestsController");
app.use('/guests', guestsController);

const listener = () => {
    console.log(`Listening on port ${port}`);
}

app.listen(port, listener)