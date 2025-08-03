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
  password: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  folders: [folderSchema],
  notes: [notesSchema]
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.isValidPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);

