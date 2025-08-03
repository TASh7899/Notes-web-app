const User = require('../models/User.js');

exports.signup = async (req, res) => {
  const { email, password, username} = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({ error: "Provide email, username and password" });
  }
  try {

    const existingUser = await User.findOne({username});
    if (existingUser) {
      return res.status(400).json({error: "username already taken"});
    }

    const user = new User({username, password, email});
    await user.save();

    res.status(201).json({message: "user created successfully"});
  } catch(err) {
    res.status(500).json({error: "failed to save data"});
  }
};

exports.login = async (req, res) => {
  const { password, username} = req.body;
  if (!username || !password) return res.status(400).json({ error :"provide username, email and password" });
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: "user not found"});
  try {
    const valid = await user.isValidPassword(password);
    if (valid) {
      req.session.userId = user._id;
      res.json({message: "login successful"});
      console.log("logged in");
    } else {
      return res.status(401).json({error: "Invalid Password"});
    }
  } catch(err) {
    res.status(500).json({error: "Internal server error"});
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if(err) {
      return res.json({error: "logout error"});
    }
    res.clearCookie('connect.sid');
    res.json({ message: "Logged out sucessfully"});
  });
}

exports.isLoggedIn = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "not logged in" });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "you are not authorized", loggedIn: false });
    }

    return res.status(200).json({ message: "authorized", loggedIn: true });

  } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "server error" });
  }
}
