const path = require("path");
const fs = require("fs");
const countNull = require("../utils/countNull");
const db = require("../database/connection");
const fileChanges = require("../utils/fileModification");
const XLSX = require("xlsx");
const axios = require("axios");
const unionTerrServices = {
  async SelectedCode(filename, attributes) {
    try {
      console.log("hi:" + attributes);
      const filePath = path.join(__dirname, "..", "uploads", filename);
      const rawData = fs.readFileSync(filePath);
      const data = JSON.parse(rawData);
      const typ = attributes[0].value;

      // Fetch union territory names from the database
      const result = await db.query("SELECT utname FROM unionterritories");
      const unionTerritories = result.rows.map((row) =>
        row.utname.toUpperCase()
      );

      let validCount = 0;
      let errorCount = 0;

      const combinedData = data.map((item) => {
        const state = item[typ];
        let valid = "Invalid";

        if (unionTerritories.includes(state.toUpperCase())) {
          valid = "Valid";
          validCount++;
        } else {
          errorCount++;
        }
        return { state, valid };
      });

      const resultData = {
        data: combinedData,
        errorcount: errorCount,
        validCount: validCount,
      };
      console.log(resultData);
      return resultData;
    } catch (err) {
      console.error("Error fetching logs:", err);
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
module.exports = unionTerrServices;
