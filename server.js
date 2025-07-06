const express = require("express");
const path = require("path");
const app = express();

// importing the route file
const customerRoutes = require("./routes/customers.js");

// middleware to read JSON from requests
app.use(express.json());

// serve frontend from /public
app.use(express.static(path.join(__dirname, "public")));

// main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// connect API routes
app.use("/api/customers", customerRoutes);

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
