const fs = require("fs"); // ✅ Add this line
const path = require("path"); // ✅ Fix: Import path
const conceptualConsistencyService = require("../services/conceptualConsistencyServices");
const pool = require("../database/connection"); // Ensure the correct path

// exports.validateLatLonState = async (req, res) => {
//     try {
//         const file = req.file;
//         if (!file) return res.status(400).json({ error: "No file uploaded" });

//         // const fileType = file.mimetype.includes("csv") ? "csv" : "xlsx";
//         const { results, errorRate, accuracy } = await conceptualConsistencyService.processLatLonState(file.path);

//         fs.unlinkSync(file.path); // ✅ Delete file after processing

//         res.json({ validationResults: results, errorRate, accuracy });
//     } catch (error) {
//         console.error("Error validating Lat-Lon & State:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };
exports.validateLatLonState = async (req, res) => {
    try {
        const { filename } = req.body; // ✅ Get JSON filename
        if (!filename) return res.status(400).json({ error: "No JSON filename provided" });

        const filePath = path.join(__dirname, "..", "uploads", filename);
        // console.log("Reading JSON file:", filePath); // Debugging

        const { results, errorRate, accuracy, invalid } = await conceptualConsistencyService.processLatLonState(filePath);

        // Save log after validation
        // await conceptualConsistencyService.saveConceptualLog(filename, ["latitude", "longitude", "state"], errorRate, accuracy, "latlong_state");

        res.json({ validationResults: results, errorRate, accuracy, invalid });
    } catch (error) {
        console.error("Error validating Lat-Lon & State:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.validateStateDistrict = async (req, res) => {
    try {
        const { filename } = req.body; // ✅ Get JSON filename
        if (!filename) return res.status(400).json({ error: "No JSON filename provided" });

        const filePath = path.join(__dirname, "..", "uploads", filename);
        // console.log("Reading JSON file:", filePath); // Debugging

        const { results, errorRate, accuracy, invalid } = await conceptualConsistencyService.processStateDistrict(filePath);

        // Save log after validation
        // await conceptualConsistencyService.saveConceptualLog(filename, ["state", "district"], errorRate, accuracy, "state_district");

        res.json({ validationResults: results, errorRate, accuracy, invalid });
    } catch (error) {
        console.error("Error validating State & District:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


exports.validatePincodeDistrict = async (req, res) => {
    try {
        const { filename } = req.body; // ✅ Get JSON filename
        if (!filename) return res.status(400).json({ error: "No JSON filename provided" });

        const filePath = path.join(__dirname, "..", "uploads", filename);
        // console.log("Reading JSON file:", filePath); // Debugging
        
        const { results, errorRate, accuracy, invalid } = await conceptualConsistencyService.processPincodeDistrict(filePath);

        // Save log after validation
        // await conceptualConsistencyService.saveConceptualLog(filename, ["pincode", "district"], errorRate, accuracy, "pincode_district");

        res.json({ validationResults: results, errorRate, accuracy, invalid });
    } catch (error) {
        console.error("Error validating Pincode & District:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.fetchLogs = async (req, res) => {
    try {
        const { category } = req.query; // Get module type from query params

        if (!category) return res.status(400).json({ error: "Category is required" });

        const logs = await conceptualConsistencyService.getLogsByCategory(category);

        res.status(200).json({ logs });
    } catch (error) {
        console.error("❌ Error fetching logs:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// exports.saveLog = async (req, res) => {
//     try {
//         const { filename, selectedAttributes, errorRate, accuracyRate, category } = req.body;

//         if (!filename || !selectedAttributes || !errorRate || !accuracyRate || !category) {
//             return res.status(400).json({ success: false, error: "Missing required fields." });
//         }

        // await conceptualConsistencyService.saveConceptualLog(filename, selectedAttributes, errorRate, accuracyRate, category);

//         console.log("✅ Log successfully saved:", filename);
//         return res.status(200).json({ success: true, message: "Log saved successfully." }); // ✅ Ensure success response
//     } catch (error) {
//         console.error("❌ Log saving error:", error);
//         return res.status(500).json({ success: false, error: "Internal Server Error" });
//     }
// };

exports.saveLog = async (req, res) => {
    const { filename, selectedAttributes, errorRate, accuracyRate, category, results } = req.body;
    
    if (!filename || !selectedAttributes || !results) {
        return res.status(400).json({ success: false, message: "Missing required parameters." });
    }

    try {
        // Path to save the file
        const filePath = path.join(__dirname, "../uploads", filename.endsWith(".json") ? filename : `${filename}.json`);


        // Ensure `valid` column is included
        const jsonData = results.map(row => ({
            ...row,
            valid: row.valid  // Ensure valid column is saved
        }));

        // Save JSON data
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

        await conceptualConsistencyService.saveConceptualLog(filename, selectedAttributes, errorRate, accuracyRate, category);

        res.json({ success: true, message: "Log saved successfully." });
    } catch (error) {
        console.error("Error saving log:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

