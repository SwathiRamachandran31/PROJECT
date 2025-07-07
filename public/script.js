let currentEditId = null; // used to track if editing mode is on

// load customer list when page loads
function loadCustomers() {
  fetch("/api/customers")
    .then(res => res.json())
    .then(customers => {
      const display = document.getElementById("customers");
      display.innerHTML = "";

      if (customers.length === 0) {
        display.innerHTML = "<p>No customers found yet.</p>";
        return;
      }

      customers.forEach(c => {
        const p = document.createElement("div");
        p.innerHTML = `
          <p>
            <strong>${c.name}</strong><br>
            Points: ${c.points}<br>
            Tier: ${c.tier}<br>
            <button onclick="startEdit(${c.id}, '${c.name}', ${c.points})">Edit</button>
            <button onclick="removeCustomer(${c.id})">Delete</button>
          </p>
        `;
        display.appendChild(p);
      });
    })
    .catch(() => {
      document.getElementById("customers").innerHTML = "<p>Error fetching data.</p>";
    });
}

// called when Edit is clicked
function startEdit(id, name, pts, level) {
  document.getElementById("name").value = name;
  document.getElementById("points").value = pts;
  currentEditId = id;
  document.getElementById("submitBtn").textContent = "Update Customer";
  document.getElementById("formError").textContent = "";
}

// delete customer
function removeCustomer(id) {
  if (!confirm("Are you sure to delete?")) return;

  fetch(`/api/customers/${id}`, { method: "DELETE" })
    .then(() => { loadCustomers();
      if (currentEditId === id) {
        document.getElementById("customerForm").reset();
        currentEditId = null;
        document.getElementById("submitBtn").textContent = "Add Customer";
      }
    })
    
    .catch(() => alert("Something went wrong while deleting."));
}

// when form is submitted
document.getElementById("customerForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const pts = parseInt(document.getElementById("points").value.trim());
  const err = document.getElementById("formError");
  err.textContent = "";

  // validations
  if (!name || isNaN(pts)) {
    err.textContent = "Please fill out everything!";
    return;
  }

  if (!/^[A-Za-z\s]+$/.test(name)) {
    err.textContent = "Name should only have letters.";
    return;
  }

  if (pts < 0 || pts % 10 !== 0) {
    err.textContent = "Points must be positive and divisible by 10.";
    return;
  }

  const data = { name, points: pts };

  if (currentEditId !== null) {
    // Update mode
    fetch(`/api/customers/${currentEditId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(resp => {
        if (!resp.ok) throw new Error();
        return resp.json();
      })
      .then(() => {
        loadCustomers();
        document.getElementById("customerForm").reset();
        document.getElementById("submitBtn").textContent = "Add Customer";
        currentEditId = null;
      })
      .catch(() => {
        err.textContent = "Could not update. Try again.";
      });
  } else {
    // Adding new
    fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(resp => {
        if (!resp.ok) throw new Error();
        return resp.json();
      })
      .then(() => {
        loadCustomers();
        document.getElementById("customerForm").reset();
      })
      .catch(() => {
        err.textContent = "Failed to add customer.";
      });
  }
});

// on page load
loadCustomers();
