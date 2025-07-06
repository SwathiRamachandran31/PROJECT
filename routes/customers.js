const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const DATA_FILE = path.join(__dirname, "../data/customers.json");

// simple helper to read the file
function readData() {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

// simple helper to write the file
function writeData(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), "utf-8");
}

// get all customers
router.get("/", (req, res) => {
  try {
    const all = readData();
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: "Error reading customers." });
  }
});

// add a customer
router.post("/", (req, res) => {
  const { name, points, tier } = req.body;

  // basic check
  if (!name || points === undefined || !tier) {
    return res.status(400).json({ error: "Missing fields." });
  }

  if (typeof points !== "number" || points < 0 || points % 10 !== 0) {
    return res.status(400).json({ error: "Points must be positive and in 10s." });
  }

  try {
    const list = readData();
    const newCust = {
      id: list.length > 0 ? list[list.length - 1].id + 1 : 1,
      name,
      points,
      tier
    };

    list.push(newCust);
    writeData(list);
    res.status(201).json(newCust);
  } catch (err) {
    res.status(500).json({ error: "Error adding customer." });
  }
});

// update a customer
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, points, tier } = req.body;

  if (!name || points === undefined || !tier) {
    return res.status(400).json({ error: "Missing fields." });
  }

  if (typeof points !== "number" || points < 0 || points % 10 !== 0) {
    return res.status(400).json({ error: "Points must be positive and divisible by 10." });
  }

  try {
    const list = readData();
    const index = list.findIndex(c => c.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ error: "Customer not found." });
    }

    // update the fields
    list[index] = {
      ...list[index],
      name,
      points,
      tier
    };

    writeData(list);
    res.json(list[index]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update customer." });
  }
});

// delete a customer
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  try {
    const list = readData();
    const index = list.findIndex(c => c.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ error: "Customer not found." });
    }

    list.splice(index, 1); // remove one element
    writeData(list);
    res.json({ message: "Deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Delete failed." });
  }
});

module.exports = router;
