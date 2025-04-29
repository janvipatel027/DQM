const fs = require("fs");
const Papa = require("papaparse");
const xlsx = require("xlsx");
const { Pool } = require("pg");

const pool = require("../database/connection");

// Function to get the correct state for given Lat-Lon
const getStateFromDB = async (lat, lon) => {
    const query = `
        SELECT state FROM state_boundaries
        WHERE ST_Contains(boundary, ST_SetSRID(ST_MakePoint($1, $2), 4326))
        LIMIT 1;
    `;
    const result = await pool.query(query, [lon, lat]); 
    return result.rows.length ? result.rows[0].state : "Unknown";
};

// Function to validate District-State consistency
const validateDistrictState = async (state, district) => {
    const query = `SELECT COUNT(*) FROM statedistricttype WHERE LOWER(state) = LOWER($1) AND LOWER(district) = LOWER($2);`;
    const result = await pool.query(query, [state, district]);
    return result.rows[0].count > 0;
};

// Function to validate Pincode-District consistency
const validatePincodeDistrict = async (pincode, district) => {
    const query = `SELECT COUNT(*) FROM pincodedistrict WHERE pincode = $1 AND LOWER(district) = LOWER($2);`;
    const result = await pool.query(query, [pincode, district]);
    return result.rows[0].count > 0;
};

const readFile = (filePath) => {
    const fileContent = fs.readFileSync(filePath, "utf8");
    
    // console.log("File content before parsing:", fileContent); // 🔍 Debugging

    try {
        return JSON.parse(fileContent);
    } catch (error) {
        console.error("❌ JSON Parsing Error:", error.message);
        throw new Error("Invalid JSON file format");
    }
};

// Process Latitude-Longitude & State Validation
exports.processLatLonState = async (filePath) => {
    let data = readFile(filePath);
    let results = [];
    let invalidCount = 0;
    // console.log("DATA: ", data);
    
    for (let row of data) {
        // console.log(row);
        const correctState = await getStateFromDB(row.latitude, row.longitude);
        row.valid = correctState.toUpperCase() === row.state.toUpperCase();
        row.correctState = correctState;
        if (row.latitude=='blank' || row.longitude=='blank' || row.state == 'blank' || !row.valid){
            invalidCount++;
        } 
        results.push(row);

    }
    
    const invalid = Number(invalidCount);
    const totalRecords = results.length;
    const errorRate = totalRecords > 0 ? ((invalidCount / totalRecords) * 100).toFixed(2) : "0";
    const accuracy = (100 - errorRate).toFixed(2);

    return { results, errorRate, accuracy, invalid };
};

// Process State-District Validation
exports.processStateDistrict = async (filePath) => {
    let data = readFile(filePath);
    let results = [];
    let invalidCount = 0;

    for (let row of data) {
        if (!row.state || !row.district) continue;

        const isDistrictValid = await validateDistrictState(row.state, row.district);
        row.validDistrict = isDistrictValid;

        if (!isDistrictValid) invalidCount++;
        results.push(row);
    }
    // console.log(results);
    const invalid = Number(invalidCount);
    const totalRecords = results.length;
    const errorRate = totalRecords > 0 ? ((invalidCount / totalRecords) * 100).toFixed(2) : "0";
    const accuracy = (100 - errorRate).toFixed(2);

    return { results, errorRate, accuracy, invalid };
};


// Process Pincode-District Validation
exports.processPincodeDistrict = async (filePath) => {
    let data = readFile(filePath);
    let results = [];
    let invalidCount = 0;

    for (let row of data) {
        if (!row.pincode || !row.district) continue;

        const isValid = await validatePincodeDistrict(row.pincode, row.district);
        row.validPincodeDistrict = isValid;

        if (!isValid) invalidCount++;
        results.push(row);
    }

    const invalid = Number(invalidCount);
    const totalRecords = results.length;
    const errorRate = totalRecords > 0 ? ((invalidCount / totalRecords) * 100).toFixed(2) : "0";
    const accuracy = (100 - errorRate).toFixed(2);

    return { results, errorRate, accuracy, invalid };
};

async function saveConceptualLog(filename, selectedAttributes, errorRate, accuracyRate, category) {
    try {
        const query = `
            INSERT INTO Conceptual_logs (filename, selected_attributes, error_rate, accuracy_rate, timestamp, category)
            VALUES ($1, $2, $3, $4, NOW(), $5)
        `;
        await pool.query(query, [filename, JSON.stringify(selectedAttributes), errorRate, accuracyRate, category]);

        console.log("✅ Log saved successfully:", filename);
        return { success: true, message: "Log saved successfully." };
    } catch (error) {
        console.error("❌ Error saving log:", error);
        throw new Error("Failed to save log.");
    }
}


async function getLogsByCategory(category) {
    try {
        const query = `SELECT * FROM Conceptual_logs WHERE category = $1 ORDER BY timestamp DESC`;
        const result = await pool.query(query, [category]);
        console.log("RESULTS IN SERVICES:" , result);
        return result.rows;
    } catch (error) {
        console.error("❌ Error fetching logs:", error);
        throw new Error("Failed to fetch logs.");
    }
}

module.exports = { ...exports, saveConceptualLog, getLogsByCategory };
