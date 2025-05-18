let notes = [{id: 0, title: "my note", content: "this is the first note"}];
let idcounter = 1;

exports.getAllNotes = (req, res) => {
  res.json(notes);
};

exports.getNotesById = (req, res) => {
  const note = notes.find(n => n.id === parseInt(req.params.id));
  if (!note) return res.status(400).json({ message: 'Note not found'});
  res.json(note);
};

exports.createNote = (req, res) => {
  const {title, content} = req.body;
  if (!title || !content) return res.status(400).json({message: "provide title and content"});

  const newNote = {
    id: idcounter++,
    title,
    content
  };
  notes.push(newNote);
  res.status(201).json(newNote);
};

exports.updateNote = (req, res) => {
  const {title, content} = req.body;
  if (!title || !content) return res.status(404).json({ message: 'provide title and content'});
  const note = notes.find(n => n.id === parseInt(req.params.id));
  if (!note) return res.status(404).json({ message: "Note not found"});

  note.title = title;
  note.content = content;

  res.json(note);
};

exports.deleteNote = (req, res) => {
  const delIndex = notes.findIndex(n => n.id === parseInt(req.params.id));
  if (delIndex === -1) return res.status(404).json({ message: "Note not found"});

  notes.splice(delIndex, 1);
  res.json({message: "note deleted sucessfully"});
};

