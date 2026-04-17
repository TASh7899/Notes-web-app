require("dotenv").config();
const express = require("express");
const app = express();
const cors = require('cors');
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require('path')
const mongoose = require('mongoose');


const notesRoutes = require('./routes/notes.js');
const authRoutes = require('./routes/userRoutes.js');
const folderRoutes = require('./routes/folder.js');

app.set('trust proxy', 1);

const allowedOrigins = [
  "https://notes-app-frontend-ox2u.vercel.app",
  "https://notes-app-frontend-ox2u-git-main-tash7899s-projects.vercel.app",
  "https://notes-app-frontend-ox2u-hm1ixvlob-tash7899s-projects.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({mongoUrl: `${process.env.MONGOURL}/auth`}),
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'}
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
  console.log(`Server started on `, process.env.PORT);
});

const verifyCronSecret = (req, res, next) => {
  const cronToken = req.headers['x-cron-secret'];
  if (cronToken && cronToken === process.env.CRON_SECRET) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized access" });
  }
};

app.get('/cron/ping-db', verifyCronSecret, async (req, res) => {
  try {
    const state = mongoose.connection.readyState;
    
    if (state !== 1) {
      throw new Error("Database not connected");
    }

    await mongoose.connection.db.admin().ping();

    res.status(200).json({ 
      status: "success", 
      message: "MongoDB is alive",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Cron Ping Failed:", error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});

