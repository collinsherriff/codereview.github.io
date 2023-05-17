js
// server.js
const express = require('express');
const unzipper = require('unzipper');
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.post('/file/post', (req, res) => {
  const zipFile = req.files.file;
  
  zipFile.mv(`./${zipFile.name}`, err => {
    if (err) res.status(500).send(err);
    
    unzipper.Open(`./${zipFile.name}`).then(zip => {
      zip.extract({
        path: './extracted'  // extract files into ./extracted folder
      }); 
      zip.close();
      
      // Use the extracted files to call Claude API...
      // Save results... 
      
      res.send('File uploaded and extracted!'); 
    });
  });
});

app.listen(3000);