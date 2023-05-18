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

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  console.log(req);
  console.log(res);
  next();    
});

app.use(express.json({ limit: '50mb' }));    
app.use(express.urlencoded({ extended: true, limit: '50mb' }));       

app.post('/file/upload', async (req, res) => {      
  console.log(req);   
  
  const zipFile = req.files.file;       
  
  zipFile.mv(`./${zipFile.name}`, err => {
    if (err) return res.status(500).send(err);
    
    unzipper.Open(`./${zipFile.name}`).then(async zip => {  
      zip.extract({            
        path: './extracted'    
      });       
      zip.close();    
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
      let prompt = `\n\nHuman: Analyse the code\n\nAssistant: ${filesText}`;  
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
}); 
