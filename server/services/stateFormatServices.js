const path = require("path");
const fs = require("fs");
const countNull = require("../utils/countNull");
const db = require("../database/connection");
const fileChanges = require("../utils/fileModification");
const XLSX = require("xlsx");
const axios = require("axios");

const stateFormateServices = {
  async SelectedCode(filename, attributes) {
    try {
      console.log("Processing attributes:", attributes);

      const filePath = path.join(__dirname, "..", "uploads", filename);

      // ** Use streaming to read large files efficiently **
      const rawData = fs.readFileSync(filePath, "utf8");
      const data = JSON.parse(rawData);

      const typ = attributes[0].value;

      // ** Optimize DB Query: Fetch all states in one go and store in a Set for O(1) lookup **
      // const result = await db.query("SELECT stateName FROM states");
      const result = await db.query("SELECT DISTINCT state FROM statedistricttype WHERE type='State'");
      const dbStatesSet = new Set(result.rows.map(row => row.state.toUpperCase()));

      let validCount = 0, errorCount = 0;
      const combinedData = data.map((item) => {
        const state = item[typ]?.toUpperCase() || ""; // Handle possible undefined values
        const valid = dbStatesSet.has(state) ? "valid" : "Invalid";

        if (valid === "valid") validCount++;
        else errorCount++;

        return { state, valid };
      });

      const response = { data: combinedData, errorcount: errorCount, validCount };
      console.log("Processed Data:", response);

      return response;
    } catch (err) {
      console.error("Error processing data:", err);
      throw new Error("Internal Server Error");
    }
  },
  async createLog(logData) {
    try {
      await db.query(
        "INSERT INTO stationcode (filename, error_percentage,created_time) VALUES ($1, $2,$3)",
        [logData.filename, logData.error_percentage, logData.created_time]
      );
    } catch (error) {
      console.error("Error creating log entry:", error);
      throw new Error("Internal Server Error");
    }
  },
  async getlogs() {
    try {
      const result = await db.query("SELECT * FROM stationcode");
      return result.rows;
    } catch (error) {
      console.error("Error creating log entry:", error);
      throw new Error("Internal Server Error");
    }
  },

  async viewFile(log) {
    console.log(log);
    try {
      const result = await db.query("SELECT * FROM stationcode");
      return result.rows;
    } catch (error) {
      console.error("Error creating log entry:", error);
      throw new Error("Internal Server Error");
    }
  },
};
module.exports = stateFormateServices;