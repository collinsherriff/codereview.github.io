# Code Reviewer
## Version 1.0.0
## Author: Collin Sherriff
This app allows users to upload ZIP files containing code for analysis. The server will unzip the upload, send the contained code files to the [Claude](https://claude.ai) API for analysis, and return the results.
## Getting Started
1. Install dependencies:
bash
npm install express unzipper axios 
2. Start the server:
bash
node server.js
 
The server will run on http://localhost:3000.
3. Upload a ZIP file on the frontend hosted on GitHub Pages. The file will be sent to the server, analyzed, and results returned to the frontend for display.
4. View analytics for uploads and results in the database.
## Roadmap
- Save uploads and analysis results to a database
- Add an admin dashboard to view analytics
- Allow users to view past uploads and results
- Add testing
- Refactor code/add types
- Add frontend registration/login for saved settings
## Contributing
Feel free to submit pull requests to contribute to this project!