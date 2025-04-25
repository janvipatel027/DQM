const path = require("path");
const fs = require("fs");
const db = require("../database/connection");

const districtFormatServices = {
  async SelectedCode(filename, attributes) {
    try {
      console.log("Processing attributes:", attributes);
      const filePath = path.join(__dirname, "..", "uploads", filename);

      // *Efficient File Reading (Streaming)*
      const rawData = fs.readFileSync(filePath, "utf8");
      const data = JSON.parse(rawData);

      const typ = attributes[0].value;

      // *Optimize DB Query*
      const result = await db.query("SELECT DISTINCT district FROM statedistricttype");
      const dbDistrictsSet = new Set(result.rows.map(row => row.district.toUpperCase()));

      let validCount = 0, errorCount = 0;
      const combinedData = data.map((item) => {
        const district = item[typ]?.toUpperCase() || "";
        const valid = dbDistrictsSet.has(district) ? "valid" : "Invalid";

        if (valid === "valid") validCount++;
        else errorCount++;

        return { district, valid };
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
        "INSERT INTO stationcode (filename, error_percentage, created_time) VALUES ($1, $2, $3)",
        [logData.filename, logData.error_percentage, logData.created_time]
      );
    } catch (error) {
      console.error("Error creating log entry:", error);
      throw new Error("Internal Server Error");
    }
  },

  async getLogs() {
    try {
      const result = await db.query("SELECT * FROM stationcode");
      return result.rows;
    } catch (error) {
      console.error("Error fetching logs:", error);
      throw new Error("Internal Server Error");
    }
  },

  async viewFile(log) {
    try {
      return await this.getLogs();
    } catch (error) {
      console.error("Error viewing file:", error);
      throw new Error("Internal Server Error");
    }
  },
};

module.exports = districtFormatServices;