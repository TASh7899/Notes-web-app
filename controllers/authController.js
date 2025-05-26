const User = require('../models/User.js');

exports.signup = async (req, res) => {
  const { email, password, username} = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({ message: "Provide email, username and password" });
  }
  try {

    const existingUser = await User.findOne({username});
    if (existingUser) {
      return res.status(400).json({message: "username already taken"});
    }

    const user = new User({username, password, email});
    await user.save();

    res.status(201).json({message: "user created successfully"});
  } catch(err) {
    res.status(500).json({message: "failed to save data"});
  }
};

exports.login = async (req, res) => {
  const { password, username} = req.body;
  if (!username || !password) return res.status(400).json("provide username, email and password");
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: "user not found"});
  try {
    const valid = await user.isValidPassword(password);
    if (valid) {
      req.session.userId = user._id;
      res.json({message: "login successful"});
      console.log("logged in");
    } else {
      return res.status(401).json({message: "Invalid Password"});
    }
  } catch(err) {
    res.status(500).json({message: "Internal server error"});
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if(err) {
      return res.json({message: "logout error"});
    }
    res.clearCookie('connect.sid');
    res.json({ message: "Logged out sucessfully"});
  });
}

exports.checkSession = async (req, res) => {
  if (req.session.userId) {
    res.status(200).json({ loggedIn: true, userId: req.session.userId})
  } else {
    res.status(401).json({ loggedIn: false});
  }
};
