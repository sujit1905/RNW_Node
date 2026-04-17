const http = require("http"); // Import HTTP module
const fs = require("fs");     // Import File System module

// Create server
const server = http.createServer((req, res) => {

  // Home route
  if (req.url === "/") {
    fs.readFile("Pages/home.html", (err, data) => {
      res.write(data); // Send home page
      res.end();
    });

  // About route
  } else if (req.url === "/about") {
    fs.readFile("Pages/about.html", (err, data) => {
      res.write(data); // Send about page
      res.end();
    });

  // Contact route
  } else if (req.url === "/contact") {
    fs.readFile("Pages/contact.html", (err, data) => {
      res.write(data); // Send contact page
      res.end();
    });

  // 404 route
  } else {
    res.write("<h1>404 Page Not Found</h1>"); // Page not found
    res.end();
  }
});

// Start server on port 3000
server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});