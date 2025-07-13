const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const app = require("../server");
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data/customers.json");

describe("Customer API Integration Tests", () => {
  const testCustomer = {
    name: "Test User",
    email: "test@example.com",
    points: 120
  };

  beforeEach(() => {
    fs.writeFileSync(DATA_FILE, "[]", "utf8");
  });

  it("should add a new customer", async () => {
    const res = await request(app).post("/api/customers").send(testCustomer);
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("id");
    expect(res.body.email).to.equal(testCustomer.email);
    expect(res.body.tier).to.equal("Silver");
  });

  it("should not allow duplicate email", async () => {
    await request(app).post("/api/customers").send(testCustomer);
    const res = await request(app).post("/api/customers").send(testCustomer);
    expect(res.status).to.equal(409);
    expect(res.body).to.have.property("error", "Email already exists.");
  });

  it("should fetch all customers", async () => {
    await request(app).post("/api/customers").send(testCustomer);
    const res = await request(app).get("/api/customers");
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array").with.lengthOf(1);
  });

  it("should update an existing customer", async () => {
    const createRes = await request(app).post("/api/customers").send(testCustomer);
    const id = createRes.body.id;

    const updatedCustomer = {
      name: "Updated Name",
      email: "updated@example.com",
      points: 350
    };

    const res = await request(app).put(`/api/customers/${id}`).send(updatedCustomer);
    expect(res.status).to.equal(200);
    expect(res.body.name).to.equal("Updated Name");
    expect(res.body.email).to.equal("updated@example.com");
    expect(res.body.points).to.equal(350);
    expect(res.body.tier).to.equal("Gold");
  });

  it("should not update a customer with duplicate email", async () => {
    await request(app).post("/api/customers").send(testCustomer);
    const res2 = await request(app).post("/api/customers").send({
      name: "Another",
      email: "another@example.com",
      points: 100
    });

    const id = res2.body.id;

    const res = await request(app).put(`/api/customers/${id}`).send({
      name: "Try Dup",
      email: "test@example.com", // Duplicate email
      points: 200
    });

    expect(res.status).to.equal(409);
    expect(res.body).to.have.property("error", "Email already in use by another customer.");
  });

  it("should delete a customer", async () => {
    const createRes = await request(app).post("/api/customers").send(testCustomer);
    const id = createRes.body.id;

    const res = await request(app).delete(`/api/customers/${id}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message", "Deleted successfully.");

    const fetchRes = await request(app).get("/api/customers");
    expect(fetchRes.body).to.be.an("array").with.lengthOf(0);
  });

  it("should return 404 for deleting a non-existent customer", async () => {
    const res = await request(app).delete("/api/customers/999");
    expect(res.status).to.equal(404);
    expect(res.body).to.have.property("error", "Customer not found.");
  });

  it("should reject invalid email", async () => {
    const res = await request(app).post("/api/customers").send({
      name: "Invalid Email",
      email: "not-an-email",
      points: 100
    });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("error", "Invalid email.");
  });

  it("should reject missing fields", async () => {
    const res = await request(app).post("/api/customers").send({
      email: "x@example.com",
      points: 100
    });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("error", "Missing fields.");
  });

  it("should reject negative or invalid points", async () => {
    const res1 = await request(app).post("/api/customers").send({
      name: "Invalid",
      email: "invalid1@example.com",
      points: -10
    });
    expect(res1.status).to.equal(400);

    const res2 = await request(app).post("/api/customers").send({
      name: "Invalid",
      email: "invalid2@example.com",
      points: 15
    });
    expect(res2.status).to.equal(400);
  });

  it("should assign correct tier based on points", async () => {
    const pointsToTier = [
      { points: 0, tier: "None" },
      { points: 100, tier: "Silver" },
      { points: 300, tier: "Gold" },
      { points: 500, tier: "Platinum" }
    ];

    for (const test of pointsToTier) {
      const res = await request(app).post("/api/customers").send({
        name: `User${test.points}`,
        email: `user${test.points}@example.com`,
        points: test.points
      });

      expect(res.status).to.equal(201);
      expect(res.body.tier).to.equal(test.tier);
    }
  });
});
