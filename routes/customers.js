const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const DATA_FILE = path.join(__dirname, "../data/customers.json");

// Helper function to read JSON data
function readCustomers() {
  const data = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(data);
}

// Helper function to write JSON data
function writeCustomers(customers) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(customers, null, 2), "utf-8");
}

// GET all customers, READ
router.get("/", (req, res) => {
  try {
    const customers = readCustomers();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: "Failed to read customers." });
  }
});

// POST a new customer, CREATE
router.post("/", (req, res) => {
  const { name, points, tier } = req.body;

  if (!name || points === undefined || !tier) {
    return res.status(400).json({ error: "Name, points, and tier are required." });
  }

  try {
    const customers = readCustomers();
    const newCustomer = {
      id: customers.length > 0 ? customers[customers.length - 1].id + 1 : 1,
      name,
      points,
      tier
    };

    customers.push(newCustomer);
    writeCustomers(customers);
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(500).json({ error: "Failed to add customer." });
  }
});

module.exports = router;