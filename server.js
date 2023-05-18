const express = require('express');
const unzipper = require('unzipper');
const axios = require('axios');

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
      
      // Call Claude API with extracted files
      let files = require('fs').readdirSync('./extracted');
      let prompt = `\n\nHuman: Here are the extracted files: ${files}\n\nAssistant:`; 
      let results = await axios.post('https://claude.ai/analyze', { prompt });
      
      
      // Save results
      // ...  
      
      res.send(results.data); 
    });
  });
});  

app.listen(3000);