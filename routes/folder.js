const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController.js')
const {requireLogin} = require('../middleware/notesMiddlerware.js')

router.get('/', requireLogin, folderController.getAllFolders);
router.post('/', requireLogin, folderController.createFolder);
router.delete('/', requireLogin, folderController.deleteFolder);
router.put('/', requireLogin, folderController.renameFolder);
router.put('/move', requireLogin, folderController.moveFolder);

module.exports = router;
