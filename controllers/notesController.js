const User = require('../models/User.js');

function findRootNote(user, id) {
  return user.notes.find(n => n._id.toString() === id) || null;
}

function removeRootNote(user, id) {
  const index = user.notes.findIndex(n => n._id.toString() === id );
  if (index !== -1) return user.notes.splice(index, 1)[0];
  return null;
}

function findNoteInFolder(folders, id) {
  for (const folder of folders) {
    const note = folder.notes.find(n => n._id.toString() === id);
    if (note) return note;

    const noteInSub = findNoteInFolder(folder.folders, id);
    if (noteInSub) return noteInSub;
  }

  return null;
}

function deleteNoteInFolder(folders, id) {
  for (const folder of folders) {
    const find = folder.notes.findIndex(n => n._id.toString() === id)
    if (find !== -1) {
      return folder.notes.splice(find, 1)[0];
    }

    const removed = deleteNoteInFolder(folder.folders, id);
    if (removed) return removed;
  }
  return null;
}


function collectNotes(user) {
  const all = [];
  (user.notes || []).forEach((n) => {
    all.push({...n.toObject(), folderPath: '', foldersArray: []});
  });

  (function recurse(folders, parentPath = []) {
    folders.forEach(folder => {
      const currentPath = [...parentPath, folder.name];
      folder.notes.forEach( n => {
        all.push({
          ...n.toObject(),
          folderPath: currentPath.join("/"),
          foldersArray: currentPath,
        });
      });
      recurse(folder.folders || [], currentPath);
    });
  })( user.folders || []);
  return all;
}

exports.getAllNotes = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: "no user were found" });

    let notes = findRootNote(user, req.params.id);
    if (!notes) notes = findNoteInFolder(user.folders, req.params.id)
    if (!notes) return res.status(404).json({ error: "note not found" });
    return res.json(notes);
  } catch (err) {
    return res.status(500).json({ error: "Invalid request" });
  }
};


exports.getNoteById = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: "no user was found" });

    let note = findRootNote(user, req.params.id);
    if (!note) note = findNoteInFolder(user.folders, req.params.id);
    if (!note) return res.status(404).json({ error: "no note was found" });

    return res.json(note);
  } catch (err) {
    res.status(400).json({ error: "invalid id" });
  }
};

exports.createNote = async (req, res) => {
  const userId = req.session.userId;
  const { title, content = "", folderPath = [] } = req.body;

  if (!title) {
    return res.status(400).json({ error: "please provide title" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "no user was found" });

    if (!Array.isArray(folderPath)) return res.status(400).json({ error: "Invalid path format" });
    if (folderPath.length === 0) {
      user.notes = user.notes || [];
      user.notes.push({title, content});
    } else {
      let current = user;
      for (const name of folderPath) {
        const next = current.folders.find(f => f.name === name);
        if (!next) return res.status(404).json({ error: "folder path not found" });
        current = next;
      }
      current.notes = current.notes || [];
      current.notes.push({ title, content });
    }
    await user.save();
    res.status(201).json({ message: "note created" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "some error occured" });
  }
};

function updateNoteById(folders, id, title, content) {
  for (const folder of folders) {
    for (const note of folder.notes || []) {
      if (note._id.toString() === id) {
        if (title) note.title = title;
        if (content) note.content = content;
        return true;
      }
    }

    if (folder.folders && folder.folders.length > 0) {
      const update = updateNoteById(folder.folders, id, title, content);
      if (update) return true;
    }
  }

  return false;
}

exports.updateNote = async (req, res) => {
  const { title, content } = req.body;
  if (!title && !content) {
    return res.status(400).json({ error: "please provide title or content" });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: "no user was found" });
    let updated = false;
    const rootNote = findRootNote(user, req.params.id);
    if (rootNote) {
      if (title) rootNote.title = title;
      if (content) rootNote.content = content;
      updated = true;
    }
    else {
      updated = updateNoteById(user.folders, req.params.id, title, content );
    }
    if (!updated) return res.status(404).json({ error: "note not found" });
    await user.save();
    res.json({message: "note was updated Successfully"});
  } catch(err) {
    res.status(400).json({ error: "update failed" });
  }
};



exports.deleteNote = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: "no user was found" });
    let deleted = removeRootNote(user, req.params.id);
    if (!deleted) deleted = deleteNoteInFolder(user.folders, req.params.id);
    if (!deleted) return res.status(404).json({ error: "note not found" });
    await user.save();
    return res.json({ message: "Successfully deleted note" });
  } catch (err) {
    return res.status(400).json({ error: "could not deleted note" });
  }
};


exports.moveNote = async (req, res) => {
  const { newFolderPath=[] } = req.body;

  if (!Array.isArray(newFolderPath)) {
    return res.status(400).json({ error: "Invalid data provided" });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: "no user was found" });

    let noteToMove = removeRootNote(user, req.params.id);
    if (!noteToMove) noteToMove = deleteNoteInFolder(user.folders, req.params.id);
    if (!noteToMove) return res.status(404).json({ error: "not found" });

    if (newFolderPath.length === 0) {
      user.notes = user.notes || [];
      user.notes.push(noteToMove);
    } else {
      let curr = user;
      for (const name of newFolderPath) {
        const next = curr.folders.find(f => f.name === name);
        if (!next) return res.status(404).json({ error: "not found" });
        curr = next;
      }
      curr.notes = curr.notes || [];
      curr.notes.push(noteToMove);
    }
    await user.save();
    return res.json({ message: "Note moved Successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({error: "Internal server error"});
  }
};
