import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Button, Modal } from "react-bootstrap";
import { PickList } from "primereact/picklist";
import { saveAs } from "file-saver";
import XLSX from "xlsx-js-style"; // Import the xlsx-js-style library

const StateDistrictValidation = () => {
  const [source, setSource] = useState([]); // Available Fields
  const [target, setTarget] = useState([]); // Selected Fields
  const [selectedFilename, setSelectedFilename] = useState("");
  const [results, setResults] = useState([]);
  const [errorRate, setErrorRate] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [showGrid, setShowGrid] = useState(false);
  const [selectedState, setSelectedState] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedValidity, setSelectedValidity] = useState("All");
  const [logs, setLogs] = useState([]);
  const [viewedResult, setViewedResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [downloadedFileName, setDownloadedFileName] = useState("");
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setSelectedFilename("");
    setSource([]);
    setTarget([]);
    setShowGrid(false);

    const formData = new FormData();
    formData.append("excelFile", selectedFile);

    try {
      const response = await axios.post("http://localhost:3001/api/generaldetails", formData);

      if (response.status === 201) {
        const jsonFilename = response.data; // ✅ Get JSON filename
        // console.log("Converted JSON Filename:", jsonFilename);
        setSelectedFilename(jsonFilename);
      }
      // setFile(selectedFile); // ✅ Save the file in state
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  const fetchFieldNames = async () => {
    if (!selectedFilename) return;

    try {
      const response = await axios.post("http://localhost:3001/api/fieldnames", { filename: selectedFilename });
      const fieldNames = response.data.field_names.map((field) => ({
        label: field,
        value: field,
      }));
      setSource(fieldNames);
    } catch (error) {
      console.error("Error fetching field names:", error);
    }
  };
  const handleUpload = async () => {
    if (!selectedFilename) {
      alert("Please select a file and wait for it to be processed.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/conceptual-consistency/state-district/upload",
        { filename: selectedFilename }, // ✅ Send JSON filename instead of file
      );
      setResults(response.data.validationResults);
      setErrorRate(response.data.errorRate);
      setAccuracy(response.data.accuracy);
      setShowGrid(true);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get("http://localhost:3001/conceptual-consistency/fetch-logs?category=state_district");
      setLogs(response.data.logs);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  // const viewResult = async (filename) => {
  //   try {
  //     const response = await axios.get(`http://localhost:3001/api/view/${filename}`);
  //     setViewedResult(response.data.file_data);
  //   } catch (error) {
  //     console.error("Error fetching past result:", error);
  //     setViewedResult(null);
  //   }
  // };
  const viewResult = async (filename) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/view/${filename}`);

      if (response.data.file_data) {
        const resultData = response.data.file_data; // Get the JSON data from file

        setViewedResult(resultData); // Store the fetched data

        setDownloadedFileName(filename); // Store filename
        setShowModal(true); // Open modal
      } else {
        console.error("Invalid data received:", response.data);
      }
    } catch (error) {
      console.error("Error fetching past result:", error);
    }
  };
  const handleSaveResults = async () => {
    if (!selectedFilename || !errorRate || !accuracy || results.length === 0) {
      alert("Run validation first before saving.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/conceptual-consistency/save-log", {
        filename: selectedFilename,
        selectedAttributes: target.map(attr => attr.value),
        errorRate,
        accuracyRate: accuracy,
        category: "state_district",
        results: results.map(row => ({
          ...row,
          valid: row.validDistrict ? "Valid" : "Invalid"  // Ensure `valid` column is included
        }))
      });
      if (response.status === 200 && response.data.success) {
        alert("Log saved successfully!");
        fetchLogs();
      } else {
        alert("Failed to save logs.");
      }
    } catch (error) {
      console.error("Error saving log:", error);
      alert("Failed to save results.");
    }
  };


  const onChange = (e) => {
    setTarget(e.target);
  };

  // Extract unique values for filters
  const uniqueStates = ["All", ...new Set(results.map((row) => row.state))];
  const uniqueDistricts = [
    "All",
    ...new Set(results.map((row) => row.district)),
  ];


  // Filter results based on selected filters
  const filteredResults = results.filter(
    (row) =>
      (selectedState === "All" || row.state === selectedState) &&
      (selectedDistrict === "All" || row.district === selectedDistrict) &&
      (selectedValidity === "All" ||
        (row.validDistrict ? "Valid" : "Invalid") === selectedValidity)
  );

  // Define columns with filters
  const columns = target.map((field) => {
    if (field.value === "state") {
      return {
        name: (
          <div className="flex flex-row">
            <span>State</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="border rounded p-1 text-sm"
            >
              {uniqueStates.map((state, index) => (
                <option key={index} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        ),
        selector: (row) => row.state,
        sortable: true,
      };
    } else if (field.value === "district") {
      return {
        name: (
          <div className="flex flex-row">
            <span>District</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="border rounded p-1 text-sm"
            >
              {uniqueDistricts.map((district, index) => (
                <option key={index} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
        ),
        selector: (row) => row.district,
        sortable: true,
      };
    } else {
      return {
        name: field.label,
        selector: (row) => row[field.value],
      };
    }
  }).concat([
    // { name: "Validity", selector: (row) => (row.valid ? "✅ Valid" : "❌ Invalid") }
    {
      name: (
        <div className="flex flex-row">
          <span>Validity</span>
          <select
            value={selectedValidity}
            onChange={(e) => setSelectedValidity(e.target.value)}
            className="border rounded p-1 text-sm"
          >
            {["All", "Valid", "Invalid"].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ),
      selector: (row) => (row.validDistrict ? "✅ Valid" : "❌ Invalid"),
    },
  ]);

  const downloadXLSX = () => {
    // Convert filtered results to sheet format
    const data = filteredResults.map((row) => ({
      Latitude: row.latitude,
      Longitude: row.longitude,
      State: row.state,
      District: row.district,
      Validity: row.validDistrict ? "Valid" : "Invalid",
    }));

    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Loop through rows to apply conditional formatting (highlight invalid rows)
    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    for (let row = range.s.r; row <= range.e.r; row++) {
      const validityCell = `E${row + 1}`; // Validity is in the 'E' column (index 4)

      // If the Validity value is 'Invalid', apply red background color
      if (worksheet[validityCell] && worksheet[validityCell].v === "Invalid") {
        worksheet[validityCell].s = {
          fill: { fgColor: { rgb: "FF0000" } }, // Red fill color for invalid
          font: { bold: true, color: { rgb: "FFFFFF" } }, // White bold text
        };
      }
    }

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Validation Results");

    // Write the workbook to an array with styles applied
    const xlsxBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Create a blob and trigger the download
    const blob = new Blob([xlsxBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "validation_results.xlsx");
  };




  const conditionalRowStyles = [
    {
      when: (row) => !row.validDistrict, // Check for validDistrict field
      style: {
        backgroundColor: "#FFCCCC", // Highlight invalid rows with a red background
      },
    },
  ];

  return (
    <div className="p-4 w-full">
      <center>
        <h2 className="text-xl font-bold mb-4">Validate State & District</h2>
        <div className="mb-4 flex gap-4">
          <input type="file" onChange={handleFileChange} />
          <Button
            onClick={fetchFieldNames}
          >
            Read Dataset
          </Button>
        </div>
        <div
          style={{
            marginTop: "1%",
            width: "70%",
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: "1" }}>
            <PickList
              source={source}
              target={target}
              itemTemplate={(item) => item.label}
              sourceHeader="Available Attribute Headings"
              targetHeader="Data Product Specification"
              showSourceControls={false}
              showTargetControls={false}
              sourceStyle={{ height: "300px" }}
              targetStyle={{ height: "300px" }}
              onChange={onChange}
            />
          </div>
        </div>
        <Button onClick={handleUpload} style={{ marginBottom: "50px" }}>Start Test</Button>


        {/* Show Error Rate */}
        {showGrid && errorRate !== null && (
          <div>
            <p className="mt-2 font-bold"><strong>Error Rate: {errorRate}%</strong></p>
            <p className="mt-2 font-bold"><strong>Accuracy: {accuracy}%</strong></p>
          </div>
        )}
        {/* Show Grid and Download Button */}
        {showGrid && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Validation Results</h3>

            <DataTable
              columns={columns}
              data={filteredResults}
              pagination
              striped
              highlightOnHover
              responsive
              conditionalRowStyles={conditionalRowStyles} // Apply the updated styles here

            />
            <div className="w-screen flex flex-row gap-4">
             <button onClick={downloadXLSX} className="bg-green-500 text-black px-4 py-2 rounded">
                Download XLSX
            </button>
            </div>

            {/* Add this button below the validation results */}
            <Button onClick={handleSaveResults} className="bg-blue-500 text-white px-4 py-2 rounded">
              Save Results
            </Button>

            {/* Logs Table */}
            <h3>Past Logs</h3>
            <table border="1">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Selected Attributes</th>
                  <th>Error Rate</th>
                  <th>Accuracy Rate</th>
                  <th>Timestamp</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.filename}</td>
                      <td>{Array.isArray(log.selected_attributes) ? log.selected_attributes.join(", ") : log.selected_attributes}</td>
                      <td>{log.error_rate}%</td>
                      <td>{log.accuracy_rate}%</td>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>
                        <Button onClick={() => viewResult(log.filename)}>👁️ View</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No logs found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
        }
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Past Validation Results - {downloadedFileName}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {viewedResult && viewedResult.length > 0 ? (
              <DataTable
                columns={Object.keys(viewedResult[0]).map((key) => ({
                  name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize column names
                  selector: (row) => row[key] !== undefined ? row[key] : "N/A", // Ensure data is always shown
                }))}
                data={viewedResult}
                pagination
                striped
                highlightOnHover

              />
            ) : (
              <p>No data available.</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>
      </center >
    </div >
  );
};

export default StateDistrictValidation;
