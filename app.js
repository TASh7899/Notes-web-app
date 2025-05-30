const express = require("express");
const app = express();
const session = require("express-session");
const MongoStore = require("connect-mongo");
const notesRoutes = require('./routes/notes.js');
const authRoutes = require('./routes/userRoutes.js');
const path = require('path')
require("dotenv").config();
const mongoose = require('mongoose');

app.use(express.json());
app.use(express.static('public'));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({mongoUrl: 'mongodb://localhost:27017/Notes'}),
  cookie: {maxAge: 1000* 60* 60}
}));

app.use('/api/notes', notesRoutes);
app.use('/api/user', authRoutes);

mongoose.connect('mongodb://localhost:27017/Notes')
  .then(() => console.log('connected to mongodb'))
  .catch((err) => console.error(`caught error: ${err.message}`));

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


