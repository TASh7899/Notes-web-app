const Note = require('../models/note.js');

exports.getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find({user: req.session.userId});
    res.json(notes);
  } catch(err) {
    res.status(500).json({ message: "Server error"});
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({_id: req.params.id, user: req.session.userId});
    if (!note) return res.status(404).json({ message: "note not found"});
    res.json(note);
  } catch(err) {
    res.status(400).json({message: "invalid id"});
  }
};

exports.createNote = async (req, res) => {
  const {title, content} = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: "title or content not found"});
  }

  try{
    const note = new Note({title, content, user: req.session.userId});
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({message: "could not create note"});
  }
};

exports.updateNote = async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: "title or content not found"});
  }

  try {
    const note = await Note.findOneAndUpdate({_id: req.params.id, user: req.session.userId}, {title, content}, {new: true, runValidators: true});
    if (!note) return res.status(404).json({message: "note not found"});
    res.json(note);
  } catch(err) {
    res.status(400).json({message: "Invalid ID or Update Error"});
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({_id: req.params.id, user: req.session.userId});
    if (!note) return res.status(404).json({message: "note not found"})
    res.json({message: "note deleted Successfully"});
  } catch(err) {
    res.status(400).json({message: "Invalid id"});
  }
};
