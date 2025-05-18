const express = require("express");
const app = express();
const notesRoutes = require('./routes/notes.js');
const path = require('path')

app.use(express.json());
app.use(express.static('public'));
app.use('/api/notes', notesRoutes);

app.use(express.static(path.join(__dirname, 'public')));

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


