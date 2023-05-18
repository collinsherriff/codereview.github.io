const express = require('express');  
const unzipper = require('unzipper');   
const axios = require('axios');
const fs = require('fs');  

// API Key  
require('dotenv').config();
const API_KEY = process.env.API_KEY;

app.get('/', (req, res) => {  
  console.log(req);  
  res.send('Hello!')  
})   

const app = express();

// Enable CORS 
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
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
  
  zipFile.mv(`./${zipFile.name}`, err => {
    if (err) return res.status(500).send(err);
  });
  
  // Extract zip file 
  unzipper.Open(`./${zipFile.name}`).then(async zip => {  
    zip.extract({            
      path: './extracted'    
    });       
    zip.close();    
  });
  
  // Get text from all files
  let filesText = '';
  let dirs = fs.readdirSync('./extracted', {withFileTypes: true});
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
  
  // Call Claude API
  const userQuestion = `Analyse the code ${filesText}`;
  const prompt = `\n\nHuman: ${userQuestion}\n\nAssistant: `; 
  client  
      .completeStream(
        {
          prompt,  
          stop_sequences: ["\n\nHuman:"],
          max_tokens_to_sample: 300, 
          model: "claude-v1",
        },
        {
          onOpen: (response) => {
            console.log("Opened stream, HTTP status code", response.status);
          },
          onUpdate: (completion) => {
            console.log(completion.completion);
          },
        }
      )
      .then((completion) => {
        console.log("Finished sampling:\n", completion);
      })
      .catch((error) => {
        console.error(error);
      });
  });
});