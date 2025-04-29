const path = require("path");
const fs = require("fs");
const db = require("../database/connection");
const fileChanges = require("../utils/fileModification");

const phoneServices = {
  // async phoneAuto(filename, attributes) {
  //   const filePath = path.join(__dirname, "..", "uploads", filename);
  //   const rawData = fs.readFileSync(filePath);
  //   const data = JSON.parse(rawData);
  //   console.log("Data from file:", data);

  //   // Function to extract specific properties from each object
  //   const extractProperties = (dataArray) => {
  //       return dataArray.map((item) => ({
  //           phone: item.phoneNo || "",
  //       }));
  //   };

  //   // Function to validate a single phone number using the provided regex pattern
  //   function isValidPhone(phone) {
  //       const phonePattern = /^[6-9][0-9]{9}$/; // Ensures a 10-digit phone number starting with 6-9
  //       return phonePattern.test(phone);
  //   }

  //   // Extracted array of objects with specific properties
  //   const extractedData = extractProperties(data);

  //   // Function to validate phone numbers and return the required array of objects
  //   function validatePhones(extractedData) {
  //       return extractedData.map((item) => ({
  //           phone: String(item.phone),
  //           isvalid: isValidPhone(String(item.phone))
  //       }));
  //   }

  //   // Validate phone numbers in the extracted data array
  //   const validatedData = validatePhones(extractedData);

  //   console.log(validatedData);

  //   return validatedData; // Return the validated data
  // },
  async phoneAuto(filename, attributes) {
    const filePath = path.join(__dirname, "..", "uploads", filename);
    const rawData = fs.readFileSync(filePath);
    const data = JSON.parse(rawData);
    console.log("Data from file:", data);

    // Function to extract specific properties dynamically
    const extractProperties = (dataArray, attributes) => {
      return dataArray.map((item) => {
        const extractedItem = {};
        attributes.forEach((attr) => {
          extractedItem[attr] = item[attr] || "";
        });
        return extractedItem;
      });
    };

    // Function to validate a single phone number using the provided regex pattern
    function isValidPhone(phone) {
      const phonePattern = /^[6-9][0-9]{9}$/; // Ensures a 10-digit phone number starting with 6-9
      return phonePattern.test(phone);
    }

    // Extract the data based on dynamic attributes
    const extractedData = extractProperties(data, attributes);

    // Function to validate phone numbers and return the required array of objects
    function validatePhones(extractedData, phoneField) {
      return extractedData.map((item) => ({
        [phoneField]: String(item[phoneField]),
        isvalid: isValidPhone(String(item[phoneField]))
      }));
    }

    // Assume user selects **only one** attribute for phone, e.g., ["phoneNo"]
    const phoneField = attributes[0]; // taking the first attribute as the phone number field

    // Validate phone numbers
    const validatedData = validatePhones(extractedData, phoneField);

    console.log(validatedData);

    return validatedData; // Return the validated data
  },

  async getPhoneLogs() {
    try {
      const result = await db.query("SELECT * FROM phone_logs");
      return result.rows;
    } catch (err) {
      console.error("Error fetching logs:", err);
      throw new Error("Internal Server Error");
    }
  },

  async createNewPhoneLog(logData) {
    await fileChanges(logData.file_name, logData.field_names);
    try {
      await db.query(
        "INSERT INTO phone_logs (file_name,accuracy,created_at) VALUES ($1,$2,now())",
        [logData.file_name, logData.created_at]
      );
    } catch (error) {
      console.error("Error creating log entry:", error);
      throw new Error("Internal Server Error");
    }
  },
};

module.exports = phoneServices;
