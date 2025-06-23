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
        div.innerHTML += `
          <div data-id="${c.id}">
            <strong>${c.name}</strong><br>
            Points: ${c.points}<br>
            Tier: ${c.tier}<br>
            <button onclick="startEdit(${c.id}, '${c.name}', ${c.points}, '${c.tier}')">Edit</button>
          </div>
        `;
      });
    });
}

function startEdit(id, name, points, tier) {
  document.getElementById("name").value = name;
  document.getElementById("points").value = points;
  document.getElementById("tier").value = tier;
  document.getElementById("customerForm").setAttribute("data-edit-id", id);
  document.querySelector("#customerForm button").textContent = "Update Customer";
}

document.getElementById("customerForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const points = parseInt(document.getElementById("points").value.trim());
  const tier = document.getElementById("tier").value;

  const id = this.getAttribute("data-edit-id");

  const method = id ? "PUT" : "POST";
  const url = id ? `/api/customers/${id}` : "/api/customers";

  fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, points, tier })
  })
    .then(res => res.json())
    .then(() => {
      fetchCustomers();
      this.reset();
      this.removeAttribute("data-edit-id");
      document.querySelector("#customerForm button").textContent = "Add Customer";
    });
});

fetchCustomers();
