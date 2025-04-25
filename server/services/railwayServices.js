const path = require("path");
const fs = require("fs");
const db = require("../database/connection");
const XLSX = require('xlsx');
const axios = require('axios');

const railwayService = {
    async getRailwayZones() {
        try {
            const result = await db.query("SELECT code, railwayzone FROM railwayzones");
            const railwayZones = {};
            result.rows.forEach(row => {
              railwayZones[row.code] = row.name;
            });
            return railwayZones;
        } catch (error) {
            console.error("Error fetching railway zones from database:", error);
            throw new Error("Internal Server Error");
        }
    },

    async SelectedCode(filename, attributes) {
        try {
            const railwayZones = await this.getRailwayZones();
            console.log(railwayZones);
            
            const filePath = path.join(__dirname, "..", "uploads", filename);
            const rawData = fs.readFileSync(filePath);
            const data = JSON.parse(rawData);

            const typ = attributes[0].value;

            let validCount = 0;
            let errorCount = 0;
            const combinedData = data.map(item => {
                const state = item[typ];
                const isValid = railwayZones.hasOwnProperty(state.toUpperCase());
                
                if (isValid) {
                    validCount++;
                } else {
                    errorCount++;
                }

                return { state, valid: isValid ? "Valid" : "Invalid" };
            });
            
            return { data: combinedData, errorcount: errorCount, validCount };
        } catch (err) {
            console.error("Error processing file:", err);
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
            const result = await db.query("SELECT * FROM stationcode");
            return result.rows;
        } catch (error) {
            console.error("Error fetching file logs:", error);
            throw new Error("Internal Server Error");
        }
    }
};

module.exports = railwayService;