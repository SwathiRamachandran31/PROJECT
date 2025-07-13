const { expect } = require("chai");
const { calculateTier } = require("../routes/customers");

describe("Tier Calculation", () => {
  it("should return 'None' for 0 points", () => {
    expect(calculateTier(0)).to.equal("None");
  });

  it("should return 'Silver' for 100 points", () => {
    expect(calculateTier(100)).to.equal("Silver");
  });

  it("should return 'Gold' for 300 points", () => {
    expect(calculateTier(300)).to.equal("Gold");
  });

  it("should return 'Platinum' for 500 points", () => {
    expect(calculateTier(500)).to.equal("Platinum");
  });
});
