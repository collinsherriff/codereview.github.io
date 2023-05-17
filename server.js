const express = require('express');  
const unzipper = require('unzipper');
const axios = require('axios');  

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use(express.json({ limit: '50mb' }));  
app.use(express.urlencoded({ extended: true, limit: '50mb' }));   

app.post('/file/post', async (req, res) => {  
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
      let results = await axios.post('https://claude.ai/analyze', { files }); 
      
      // Save results
      // ... 
      
      res.send(results.data); 
    });
  });
});

app.listen(3000);
