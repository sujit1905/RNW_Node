const http = require('http');   // Import HTTP module
const fs = require('fs');       // Import File System module
const port = 3000;              // Port number

// Function to handle incoming requests
const handlereq = (req, res) => {
    let filename = "";

    // Decide which file to serve based on URL
    switch (req.url) {
        case '/':
            filename = "Home.html";
            break;
        case '/About':
            filename = "About.html";
            break;
        case '/Contact':
            filename = "Contact.html";
            break;
        default:
            filename = "404.html"; // Default page
            break;
    }

    // Read and send the file
    fs.readFile(filename, (err, result) => {
        if (!err) {
            res.end(result);
        }
    });
};

// Create server
const server = http.createServer(handlereq);

// Start server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});