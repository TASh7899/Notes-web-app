const express = require("express");
const router = express.Router();
const {requireLogin} = require('../middleware/notesMiddlerware.js')
const notesController = require('../controllers/notesController.js');

//router
router.get('/',requireLogin ,notesController.getAllNotes);
router.post('/',requireLogin ,notesController.createNote);
router.get('/:id',requireLogin, notesController.getNoteById);
router.put('/:id',requireLogin, notesController.updateNote);
router.delete('/:id',requireLogin, notesController.deleteNote);

module.exports = router;
