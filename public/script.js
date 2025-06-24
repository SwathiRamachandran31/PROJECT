let editingCustomerId = null; // Track if editing

function fetchCustomers() {
  fetch("/api/customers")
    .then(res => res.json())
    .then(data => {
      const div = document.getElementById("customers");
      div.innerHTML = "";

      if (data.length === 0) {
        div.innerHTML = "<p>No customers found.</p>";
        return;
      }

      data.forEach(c => {
        const customerDiv = document.createElement("div");
        customerDiv.innerHTML = `
          <p>
            <strong>${c.name}</strong><br>
            Points: ${c.points}<br>
            Tier: ${c.tier}<br>
            <button onclick="editCustomer(${c.id}, '${c.name}', ${c.points}, '${c.tier}')">Edit</button>
            <button onclick="deleteCustomer(${c.id})">Delete</button>
          </p>
        `;
        div.appendChild(customerDiv);
      });
    })
    .catch(err => {
      document.getElementById("customers").innerHTML = `<p>Error loading customers: ${err}</p>`;
    });
}

// Edit button logic: populate form with existing data
function editCustomer(id, name, points, tier) {
  document.getElementById("name").value = name;
  document.getElementById("points").value = points;
  document.getElementById("tier").value = tier;
  editingCustomerId = id;

  document.getElementById("submitBtn").textContent = "Update Customer";
}

// Delete customer
function deleteCustomer(id) {
  if (!confirm("Are you sure you want to delete this customer?")) return;

  fetch(`/api/customers/${id}`, {
    method: "DELETE"
  })
    .then(res => res.json())
    .then(() => fetchCustomers())
    .catch(err => alert("Error deleting customer: " + err.message));
}

// Handle form submit for add or update
document.getElementById("customerForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const points = parseInt(document.getElementById("points").value.trim());
  const tier = document.getElementById("tier").value;

  if (!name || isNaN(points) || !tier) {
    alert("Please fill in all fields.");
    return;
  }

  const customer = { name, points, tier };

  if (editingCustomerId !== null) {
    // Update
    fetch(`/api/customers/${editingCustomerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customer)
    })
      .then(res => res.json())
      .then(() => {
        fetchCustomers();
        document.getElementById("customerForm").reset();
        editingCustomerId = null;
        document.getElementById("submitBtn").textContent = "Add Customer";
      })
      .catch(err => alert("Error updating customer: " + err.message));
  } else {
    // Add new
    fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customer)
    })
      .then(res => res.json())
      .then(() => {
        fetchCustomers();
        document.getElementById("customerForm").reset();
      })
      .catch(err => alert("Error adding customer: " + err.message));
  }
});

fetchCustomers();
