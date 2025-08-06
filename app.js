const express = require("express");
const app = express();
const cors = require('cors');
const session = require("express-session");
const MongoStore = require("connect-mongo");
const notesRoutes = require('./routes/notes.js');
const authRoutes = require('./routes/userRoutes.js');
const folderRoutes = require('./routes/folder.js');
const path = require('path')
require("dotenv").config();
const mongoose = require('mongoose');

app.use(cors({
  origin: ["notes-app-frontend-ox2u.vercel.app",
"notes-app-frontend-ox2u-git-main-tash7899s-projects.vercel.app",
"notes-app-frontend-ox2u-hm1ixvlob-tash7899s-projects.vercel.app"],
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({mongoUrl: `${process.env.MONGOURL}/auth`}),
  cookie: {maxAge: 1000* 60* 60, httpOnly: true, secure: true, sameSite: 'none'}
}));

app.use('/api/notes', notesRoutes);
app.use('/api/user', authRoutes);
app.use('/api/folders', folderRoutes);

app.get('/test', (req, res) => {
  return res.json({message : "server says hello"});
})

mongoose.connect(`${process.env.MONGOURL}/Notes`)
  .then(() => console.log('connected to mongodb'))
  .catch((err) => console.error(`caught error: ${err.message}`));

app.listen(process.env.PORT, () => {
  console.log(`Server started`);
});


