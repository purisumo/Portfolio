const express = require('express');
const app = express();
const port = 8000;

// Serve static files (like your Three.js code)
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html'); // Replace with your HTML file
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
