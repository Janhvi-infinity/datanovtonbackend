const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // parse application/json
// Add middleware to enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Replace with your React app's domain
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Add 'PUT' to the allowed methods
  next();
});

app.get('/', (req, res) => {
  res.send('Hello, World!'); // Send a response to the root URL
});

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix+ ".json"); // File name for uploaded files
  }
});
const upload = multer({ storage });



// API endpoint for file upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  // Handle file upload logic here
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'No file uploaded' });
  } else {
    res.json({ message: 'File uploaded successfully', file: req.file });
  }
});

// Set the JSON file path
const jsonFilePath = path.join(__dirname, 'uploads', 'data.json');

// Read the JSON file
const jsonData = JSON.parse(fs.readFileSync(jsonFilePath));

// Define API endpoint
app.get('/getDocuments', (req, res) => {
  try {
    // Prepare response object with all documents
    const response = {
      documents: jsonData
    };

    // Send response
    res.json(response);
  } catch (error) {
    // Handle error
    console.error(error);
    res.status(500).json({ error: 'Failed to get documents' });
  }
});

app.put('/editDocument/:documentId', (req, res) => {
  try {
    const documentId = req.params.documentId;
    const englishText = req.body.englishText; // Access the englishText property
    console.log(englishText);
    // Find the document in the JSON data by its ID
    const documentIndex = jsonData.findIndex(doc => doc['DOC NO:'] === parseInt(documentId));

    if (documentIndex !== -1) {
      // Update the English text of the document
      jsonData[documentIndex].English = englishText;

      // Write the updated JSON data to the file
      function writeJSONFile(filePath, data) {
        try {
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
          return null; // return null if successful
        } catch (error) {
          // return the error if it occurs
          return error;
        }
      }
      

      // Send success response
      res.json({ message: 'Document updated successfully' });
    } else {
      // Send error response if document not found
      res.status(404).json({ error: 'Document not found' });
    }
  } catch (error) {
    // Handle error
    console.error(error);
    res.status(500).json({ error: 'Failed to edit document' });
  }
});

// Update English text of a specific document
app.put('/documents/:docNo/english', (req, res) => {
  const docNo = req.params.docNo;
  const englishText = req.body.englishText;

  // Read the data.json file
  fs.readFile('./upload/data.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read data.json file.' });
    }

    try {
      // Parse the JSON data
      const documents = JSON.parse(data);

      // Find the document with the given docNo
      const document = documents.find(doc => doc['DOC NO:'] === parseInt(docNo));

      if (!document) {
        return res.status(404).json({ error: 'Document not found.' });
      }

      // Update the English text
      document['English'] = englishText;

      // Write the updated data back to data.json file
      fs.writeFile('./upload/data.json', JSON.stringify(documents), (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to update data.json file.' });
        }

        res.json({ success: true, message: 'English text updated successfully.' });
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update English text.' });
    }
  });
});


// Start the Express app
app.listen(3040, () => {
  console.log('Server is running on http://localhost:3040');
});
