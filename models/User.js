const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const notesSchema = require('./note.js');

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  notes: [notesSchema],
  folders: [],
  createdAt: { type: Date, default: Date.now },
});

folderSchema.add({ folders: [folderSchema] })

const userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String},
  email: {type: String, required: true, unique: true},
  googleId: {type: String, unique: true, sparse: true},
  folders: [folderSchema],
  notes: [notesSchema]
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.isValidPassword = function (password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);

