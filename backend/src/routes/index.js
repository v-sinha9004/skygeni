const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Helper function to read JSON files
const readJsonFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return { error: "Unable to read file" };
  }
};

// Route 1: Send JSON for accountIndustry.json
router.get("/api/accountIndustry", (req, res) => {
  const filePath = path.join(__dirname, "../../data/accountIndustry.json");
  const data = readJsonFile(filePath);
  res.json(data);
});

// Route 2: Send JSON for customerType.json
router.get("/api/customerType", (req, res) => {
  const filePath = path.join(__dirname, "../../data/customerType.json");
  const data = readJsonFile(filePath);
  res.json(data);
});

// Route 3: Send JSON for team.json
router.get("/api/team", (req, res) => {
  const filePath = path.join(__dirname, "../../data/team.json");
  const data = readJsonFile(filePath);
  res.json(data);
});

module.exports = (app) => {
  app.use(router);
};
