const express = require('express');
const unzipper = require('unzipper'); 
const axios = require('axios');
const fs = require('fs');

// Add Claude API token
require('dotenv').config();
const API_TOKEN = process.env.API_TOKEN;

app.get('/', (req, res) => {
    res.send('Hello!')
  })  

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();   
});

app.use(express.json({ limit: '50mb' }));   
app.use(express.urlencoded({ extended: true, limit: '50mb' }));      

app.post('/file/upload', async (req, res) => {     
  const zipFile = req.files.file;      
  
  zipFile.mv(`./${zipFile.name}`, err => {
    if (err) return res.status(500).send(err);
    
    unzipper.Open(`./${zipFile.name}`).then(async zip => {
      zip.extract({           
        path: './extracted'   
      });        
      zip.close();   
      
      // Read extracted files and convert to text
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
      
      // Call Claude API with text
      let prompt = `\n\nHuman: Analyse the code\n\nAssistant: ${filesText}`;   
      let results = await axios.post('https://claude.ai/analyze', { prompt }, {
        headers: { Authorization: `Token ${API_TOKEN}` }
      });
      
      
      // Save results
      // ...   
      
      res.send(results.data); 
    });
  });
});   

app.listen(3000);