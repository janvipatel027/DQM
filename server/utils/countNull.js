const db = require("../database/connection");

const countNull = async (data, attributes) => {
  const counts = {};

  // Fetch values from the database **before** defining `handleNullValues`
  const result = await db.query("SELECT values FROM ommissioncheckvalues");
  const valuesToCount = new Set(result.rows.map(row => row.values?.toUpperCase())); // ✅ Ensure safe access with `?.`

  const handleNullValues = (val) => {
    if (typeof val === "string" && valuesToCount.has(val.toUpperCase())) { // ✅ Ensure `val` is a string
      return val.toUpperCase();
    } else {
      return false;
    }
  };

  let totalRows = 0;
  let rowsWithValuesToCount = 0;

  data.forEach((entry) => {
    Object.keys(entry).forEach((column) => {
      if (attributes.includes(column)) {
        if (!counts[column]) {
          counts[column] = Object.fromEntries([...valuesToCount].map((val) => [val, 0]));
        }
        const value = handleNullValues(entry[column]);
        if (value) {
          counts[column][value]++;
          rowsWithValuesToCount++;
        }
      }
    });
    totalRows++;
  });

  counts["cols"] = attributes.length;
  counts["rows"] = data.length;
  counts["omitted"] = Number(rowsWithValuesToCount);
  counts["omissionRate"] = Number(
    (((rowsWithValuesToCount) / (attributes.length * data.length)) * 100).toFixed(2)
  );
  console.log("Counts:", counts.cols, counts.rows, counts.omitted, counts.omissionRate);

  
  return counts;
};

module.exports = countNull;
