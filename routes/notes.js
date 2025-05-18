const express = require("express");
const router = express.Router();
const notesController = require('../controllers/notesController.js');

//router
router.get('/', notesController.getAllNotes);
router.post('/', notesController.createNote);
router.get('/:id', notesController.getNotesById);
router.put('/:id', notesController.updateNote);
router.delete('/:id', notesController.deleteNote);

module.exports = router;
