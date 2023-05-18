const express = require('express');  
// Express, the lib every Node project needs!
const unzipper = require('unzipper');
// Unzipper, for unzipping zip files. Groundbreaking!  
const axios = require('axios');  
// We're using Axios to make requests to the API. Fancy!
const fs = require('fs');  
// Ah yes, the built-in FS module. How original!

// Add Claude API token  
require('dotenv').config();
// Shh don't tell anyone our secret API token!
const API_TOKEN = process.env.API_TOKEN;  

app.get('/', (req, res) => {
  console.log(req); 
  // Someone hit our homepage! How exciting!
  res.send('Hello!')  
})   

const app = express();
// Hello Express, my old friend

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  // Yes, we want ALL the CORS! 
  console.log(req);
  console.log(res); 
  // Log the request and response? Groundbreaking idea!
  next();    
});  

app.use(express.json({ limit: '50mb' }));    
// Accept JSON requests up to 50mb. Ambitious!   
app.use(express.urlencoded({ extended: true, limit: '50mb' }));       
// Also accept URL-encoded requests up to 50mb. Generous!

app.post('/file/upload', async (req, res) => {     
  console.log(req);  
   // Someone is uploading a file! How exciting!  
  const zipFile = req.files.file;       
  
  zipFile.mv(`./${zipFile.name}`, err => {
    if (err) return res.status(500).send(err);
    // Oh no, an error! How tragic!
    
    unzipper.Open(`./${zipFile.name}`).then(async zip => {  
      zip.extract({            
        path: './extracted'    
      });       
      zip.close(); 
      // Unzip the file (wink wink), then close the zip. Very logical!   
    
      // Read extracted files and convert to text  
      let filesText = '';
      let dirs = fs.readdirSync('./extracted', {withFileTypes: true});
      // Loop through all the files.
      for (let dir of dirs) {
        if (dir.isDirectory()) {  
          let subdir = fs.readdirSync(`./extracted/${dir.name}`);
          filesText += `${dir.name}\n`;  
          // Add the directory name.
          for (let file of subdir) {
            filesText += `  ${file}\n`;
            // Add the file name.  
            filesText += fs.readFileSync(`./extracted/${dir.name}/${file}`, 'utf8');
            // Read the file contents.
            filesText += '\n\n';
          } 
        }
      }
      
      // Call Claude API with text  
      let prompt = `\n\nHuman: Analyse the code\n\nAssistant: ${filesText}`;    
      let results = await axios.post('https://claude.ai/analyze', { prompt }, { 
        headers: { Authorization: `Token ${API_TOKEN}` }  
      });
      console.log(results);   
      // Log the API response. Debugging win!  
      
      // Save results  
      // ...    
      
      res.send(results.data); 
    });
  }); 
});  

app.listen(3000);