// Fetch and display all customers
function fetchCustomers() {
  fetch("/api/customers")
    .then(res => res.json())
    .then(data => {
      const div = document.getElementById("customers");
      div.innerHTML = ""; // Clear existing data
      if (data.length === 0) {
        div.innerHTML = "<p>No customers found.</p>";
        return;
      }

      data.forEach(c => {
        div.innerHTML += `
          <p>
            <strong>${c.name}</strong><br>
            Points: ${c.points}<br>
            Tier: ${c.tier}
          </p>
        `;
      });
    })
    .catch(err => {
      document.getElementById("customers").innerHTML = `<p>Error loading customers: ${err}</p>`;
    });
}

// Handle form submit
document.getElementById("customerForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const points = parseInt(document.getElementById("points").value.trim());
  const tier = document.getElementById("tier").value;

  /*if (!name || isNaN(points) || !tier) {
    alert("Please fill in all fields correctly.");
    return;
  }**/

  fetch("/api/customers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, points, tier })
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to add customer");
      }
      return res.json();
    })
    .then(data => {
      fetchCustomers(); // Refresh the customer list
      document.getElementById("customerForm").reset();
    })
    .catch(err => {
      alert("Error adding customer: " + err.message);
    });
});

// Initial load
fetchCustomers();
