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

// PUT update customer, UPDATE
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, points, tier } = req.body;

  if (!name || points === undefined || !tier) {
    return res.status(400).json({ error: "Name, points, and tier are required." });
  }

  try {
    let customers = readCustomers();
    const customerIndex = customers.findIndex(c => c.id === parseInt(id));

    if (customerIndex === -1) {
      return res.status(404).json({ error: "Customer not found" });
    }

    customers[customerIndex] = {
      ...customers[customerIndex],
      name,
      points,
      tier
    };

    writeCustomers(customers);
    res.json(customers[customerIndex]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update customer." });
  }
});


// DELETE a customer, DELETE
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  try {
    let customers = readCustomers();
    const index = customers.findIndex(c => c.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ error: "Customer not found" });
    }

    customers.splice(index, 1); // Remove the customer
    writeCustomers(customers);
    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete customer." });
  }
});


module.exports = router;