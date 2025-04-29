import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { DataTable as PrimeTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button, Modal } from "react-bootstrap";
import { PickList } from "primereact/picklist";
import { saveAs } from "file-saver"; // Import file-saver library
import XLSX from "xlsx-js-style"; // Import the xlsx-js-style library

const LatLonStateValidation = () => {
    const [source, setSource] = useState([]); // Available Fields
    const [target, setTarget] = useState([]); // Selected Fields
    const [selectedFilename, setSelectedFilename] = useState("");
    const [results, setResults] = useState([]);
    const [errorRate, setErrorRate] = useState(null);
    const [accuracy, setAccuracy] = useState(null);
    const [showTable, setShowTable] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [selectedState, setSelectedState] = useState("All");
    const [selectedValidity, setSelectedValidity] = useState("All");
    const [logs, setLogs] = useState([]);
    const [viewedResult, setViewedResult] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [downloadedFileName, setDownloadedFileName] = useState("");
    // const [responseData, setResponseData] = useState(null);
    const handleFileChange = async (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        setSelectedFilename("");
        setSource([]);
        setTarget([]);
        setShowTable(false);

        const formData = new FormData();
        formData.append("excelFile", selectedFile);

        try {
            const response = await axios.post("http://localhost:3001/api/generaldetails", formData);

            if (response.status === 201) {
                const jsonFilename = response.data; // Get JSON filename
                // console.log("Converted JSON Filename:", jsonFilename);
                setSelectedFilename(jsonFilename);
            }
            // setFile(selectedFile); 
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
                "http://localhost:3001/conceptual-consistency/lat-lon-state/upload",
                { filename: selectedFilename }, // ✅ Send JSON filename instead of file
            );

            console.log("Server Response:", response);
            const row = {
                filename: selectedFilename,
                total: response.data.validationResults.length,
                validCount: response.data.validationResults.length - response.data.invalid,
                invalidCount: response.data.invalid,
                accuracyRate: response.data.accuracy + "%",
                errorRate: response.data.errorRate + "%",
            }
            setResults(response.data.validationResults);
            setErrorRate(response.data.errorRate);
            setAccuracy(response.data.accuracy);
            setShowTable(true);
            setTableData([row]);
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await axios.get("http://localhost:3001/conceptual-consistency/fetch-logs?category=latlong_state");
            // console.log("Logs fetched: ", response.data);
            setLogs(response.data.logs);
        } catch (error) {
            console.error("Error fetching logs:", error);
        }
    };

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
                category: "latlong_state",
                results: results.map(row => ({
                    ...row,
                    valid: row.valid ? "Valid" : "Invalid"  // Ensure `valid` column is included
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
    const uniqueStates = useMemo(() => {
        const states = results.map((row) => row.state);
        return ["All", ...new Set(states)];
    }, [results]);

    const filteredResults = useMemo(() => {
        let filtered = results;
        if (selectedState && selectedState !== "All") {
            filtered = filtered.filter((row) => row.state === selectedState);
        }
        if (selectedValidity !== "All") {
            filtered = filtered.filter((row) =>
                selectedValidity === "Valid" ? row.valid : !row.valid
            );
        }
        return filtered;
    }, [results, selectedState, selectedValidity]);

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
        } else {
            return {
                name: field.label,
                selector: (row) => row[field.value],
            };
        }
    }).concat([
        { name: "Correct State", selector: (row) => row.correctState },
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
            selector: (row) => (row.valid ? "✅ Valid" : "❌ Invalid"),
        },
    ]);

    const conditionalRowStyles = [
        {
            when: (row) => !row.valid,
            style: {
                backgroundColor: "#FFCCCC",
            },
        },
    ];

    const downloadXLSX = () => {
        // Convert filtered results to sheet format
        const data = filteredResults.map((row) => ({
            Latitude: row.latitude,
            Longitude: row.longitude,
            "Uploaded State": row.state,
            "Correct State": row.correctState,
            Validity: row.valid ? "Valid" : "Invalid",
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



    return (
        <div>
            <center>
                <h2 className="text-xl font-bold mb-4">Validate Lat-Lon & State</h2>
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

                <Button onClick={handleUpload} style={{ margin: "20px" }}>Start Test</Button>
                {showTable && (
                    <div>
                        {/* {accuracy !== null && (
                            <p className="mt-2 font-bold"><strong>Accuracy: {accuracy}%</strong></p>
                        )}

                        {errorRate !== null && (
                            <p className="mt-2 font-bold"><strong>Error Rate: {errorRate}%</strong></p>
                        )} */}

                        <PrimeTable
                            value={tableData}
                            style={{ width: "90%", margin: "10px" }}>
                            <Column
                                field="filename"
                                header="Name of File"
                                style={{ width: "25%", border: "1px solid black" }}
                            ></Column>
                            <Column
                                field="total"
                                header="Total Count"
                                style={{ width: "15%", border: "1px solid black" }}
                            ></Column>
                            <Column
                                field="validCount"
                                header="Valid Count"
                                style={{ width: "15%", border: "1px solid black" }}
                            ></Column>
                            <Column
                                field="invalidCount"
                                header="Invalid Count"
                                style={{ width: "15%", border: "1px solid black" }}
                            ></Column>
                            <Column
                                field="accuracyRate"
                                header="Accuracy Rate"
                                style={{ width: "15%", border: "1px solid black" }}
                            ></Column>
                            <Column
                                field="errorRate"
                                header="Error Rate"
                                style={{ width: "25%", border: "1px solid black" }}
                            ></Column>
                        </PrimeTable>

                        <div className="mt-4" style={{ width: "97%" }}>
                            <h3 className="text-lg font-semibold">Validation Results</h3>

                            <div className="flex flex-col">
                                <DataTable
                                    columns={columns}
                                    data={filteredResults}
                                    pagination
                                    striped
                                    highlightOnHover
                                    responsive
                                    conditionalRowStyles={conditionalRowStyles} // Apply the updated styles here
                                />
                                {/* Add Download CSV button */}
                                <Button onClick={downloadXLSX} className="px-4 py-2 rounded height-10 width-10 " style={{ alignSelf: "flex-end" }}>
                                    Download
                                </Button>
                            </div>

                            {/* Add this button below the validation results */}
                            <Button onClick={handleSaveResults} className="bg-blue-500 text-white px-4 py-2 m-4 rounded">
                                Save Results
                            </Button>


                            {/* Logs Table */}

                        </div>
                    </div>
                )}
                <h3>Past Logs</h3>
                <div className="card"  style={{ width: "85%", marginBottom: "20px" }}>
                <PrimeTable value={logs} paginator rows={5}
                    rowsPerPageOptions={[5, 10, 25, 50]}  tableStyle={{ minWidth: "5rem" }}>
                    <Column
                        field="filename"
                        header="Name of File"
                        style={{ width: "25%"}}
                    ></Column>
                    <Column
                        field="selected_attributes"
                        header="Selected Attributes"
                        style={{ width: "25%" }}
                        body={(rowData) => (
                            <div>
                                {Array.isArray(rowData.selected_attributes)
                                    ? rowData.selected_attributes.join(", ")
                                    : rowData.selected_attributes}
                            </div>
                        )}
                    ></Column>
                    <Column
                        field="error_rate"
                        header="Error Rate"
                        style={{ width: "10%"}}
                        body={(rowData) => (
                            <div>
                                {rowData.error_rate}%
                            </div>
                        )}
                    ></Column>
                    <Column
                        field="accuracy_rate"
                        header="Accuracy Rate"
                        style={{ width: "10%"}}
                        body={(rowData) => (
                            <div>
                                {rowData.accuracy_rate}%
                            </div>
                        )}
                    ></Column>
                    <Column
                        field="timestamp"
                        header="Timestamp"
                        style={{ width: "15%"}}
                    ></Column>
                    <Column
                        field="view"
                        header="View"
                        style={{ width: "15%"}}
                        body={(rowData) => (
                            <Button onClick={() => viewResult(rowData.filename)}>👁️ View</Button>
                        )}
                    ></Column>
                </PrimeTable>
                </div>
                
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
            </center>
        </div>
    );
};

export default LatLonStateValidation;

















