const express = require('express');
const unzipper = require('unzipper');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Validate and handle file upload
function validateFile(req, res, next) {
  if (!req.files) {
    return res.status(400).send('No files were uploaded.');
  }
  
  next(); 
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.post('/file/upload', validateFile, async (req, res) => {
  console.log(req);

  const zipFile = req.files.file;

  zipFile.mv(`./${zipFile.name}`, (err) => {
    if (err) return res.status(500).send(err);
  });

  // Extract zip file
  unzipper.Open(`./${zipFile.name}`).then(async (zip) => {
    zip.extract({
      path: './extracted'
    });
    zip.close();

    // Get text from all files
    let filesText = '';
    let dirs = fs.readdirSync('./extracted', { withFileTypes: true });
    for (let dir of dirs) {
      if (dir.isDirectory()) {
        let subdir = fs.readdirSync(`./extracted/${dir.name}`);
        filesText += `${dir.name}\n`;
        for (let file of subdir) {
          filesText += `  ${file}\n`;
          filesText += fs.readFileSync(`./extracted/${dir.name}/${file}`, 'utf8');
          filesText += '\n\n';
        }
      }
    }

    // Call Anthropic AI API
    const userQuestion = `Analyse the code ${filesText}`;
    const prompt = `\n\nHuman: ${userQuestion}\n\nAssistant:`;

    axios
      .post('https://api.anthropic.com/', {
        prompt,
        // Add any other necessary parameters
      })
      .then((response) => {
        const completion = response.data.completion;
        console.log(completion);
      })
      .catch((error) => {
        console.error(error);
      });
  });
});

app.get('/', (req, res) => {
  console.log(req);
  res.send('Hello!');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
