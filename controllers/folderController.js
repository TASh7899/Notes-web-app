const User = require('../models/User.js');

exports.getAllFolders = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: "user not found" });

    return res.json({ folders: user.folders, notes : user.notes });
  } catch (err) {
    res.status(500).json({ error: "An error occured" });
  }
};

function findFolderByPath(folders, path) {
  if (path.length === 0) {
    return { folders };
  }

  let current = { folders };
  for (const name of path) {
    const next = current.folders.find(f => f.name === name);
    if (!next) return null;
    current = next;
  }
  return current;
}


exports.createFolder = async (req, res) => {
  const { name, folderPath = [] } = req.body;
  if (!name) return res.status(400).json({ error: "please provide folder name" });

  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: "user not found" });

    const parent = findFolderByPath(user.folders, folderPath);
    if (!parent) return res.status(404).json({ error: "invalid folder path" });

    parent.folders.push({ name, notes:[], folders: [] });
    await user.save();
    res.json({ message: "successfully created folder" })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "some error occured,"});
  }
}

function deleteFolderByPath(folders, path) {
  if (path.length === 0) return null;

  const target = path[path.length - 1];
  const parentPath = path.slice(0, -1);

  const parent = findFolderByPath(folders, parentPath);
  if (!parent) {
    return null;
  }

  const index = parent.folders.findIndex(f => f.name === target);
  if (index === -1) return null;


  const [deletedFolder] = parent.folders.splice(index, 1);
  return deletedFolder;
}

exports.deleteFolder = async (req, res) => {
  const folderPath = req.body.folderPath;

  if (!Array.isArray(folderPath) ||  folderPath.length === 0) {
    return res.status(400).json({ error: "User not found" });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: "user not found" });

    const deleted = deleteFolderByPath(user.folders, folderPath);
    if (!deleted) return res.status(404).json({ error: "folder not found" });

    await user.save();
    res.json({ message: "successfully deleted folder" });
  } catch (err) {
    res.status(500).json({ error: "failed to delete folder", err });
  }
};


exports.renameFolder = async (req, res) => {
  const { folderPath, newName } = req.body;
  if (!Array.isArray(folderPath) || folderPath.length === 0 || !newName) {
    return res.status(400).json({ error: "please provide folderPath and new name" });
  }

  try {
    const parentPath = folderPath.slice(0, -1);
    const currentName = folderPath[folderPath.length - 1];

    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: "user not found" });

    const parentFolder = findFolderByPath(user.folders, parentPath);
    if (!parentFolder) return res.status(404).json({ error: "Invalid folder Path" });

    const targetFolder = findFolderByPath(user.folders, folderPath);
    if (!targetFolder) return res.status(404).json({error: "folder not found"});

    const duplicate = parentFolder.folders.find(f => f.name === newName && f != targetFolder);
    if (duplicate) return res.status(400).json({ error: "Folder with this name already exists" });

    const cleanName = newName.trim();

    targetFolder.name = newName;
    await user.save();

    res.json({ message: "folder renamed successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to rename folder" });
  }
};


exports.moveFolder = async (req, res) => {
  const {folderPath, newParentPath} = req.body;

  if (!Array.isArray(folderPath) || folderPath.length === 0 || !Array.isArray(newParentPath)) {
    return res.status(400).json({ error: "please provide valid folder path" });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: "user not found" });

    const folderToMove = deleteFolderByPath(user.folders, folderPath);
    if (!folderToMove) return res.status(404).json({ error: "folder do not exist" });

    const parentFolder = findFolderByPath(user.folders, newParentPath);
    if (!parentFolder) return res.status(404).json({error: "parent do not exist"});

    if (!Array.isArray(parentFolder.folders)) {
      parentFolder.folders = [];
    }

    parentFolder.folders.push(folderToMove);
    await user.save();
    res.json({message: "folder moved successfully"});
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "failed to move folder" });
  }
}

