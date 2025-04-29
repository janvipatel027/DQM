import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx"; // Import XLSX library
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
// import { Modal, Button } from 'react-bootstrap';
import { Modal, Button, Table } from "react-bootstrap";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { FixedSizeList as List } from "react-window";
import styled from "styled-components";

const MainContainer = styled.div`
  padding: 40px;
`;

const DataContainer = styled.div`
  margin-top: 42px;
`;

const TableRow = ({ index, style, data }) => {
  const row = data[index];
  return (
    <div
      style={{
        ...style,
        display: "flex",
        borderBottom: "1px solid #ccc",
        padding: "0 10px",
        alignItems: "center",
        backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white",
      }}
    >
      {Object.keys(row).map((key) => (
        <div
          key={key}
          style={{
            flex: 1,
            padding: "10px",
            borderRight: "1px solid #ddd",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={row[key]}
        >
          {row[key]}
        </div>
      ))}
    </div>
  );
};

const YourComponent = () => {
  const [jsonData, setJsonData] = useState([]);
  const [jData, setJData] = useState([]);
  const [responseData, setResponseData] = useState([]);
  // const [accuracy, setAccuracy] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [tableData, setTableData] = useState([]);
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    const formData = new FormData();
    formData.append("excelFile", selectedFile);
    formData.append("fileName", selectedFile.name); // Add file name to form data
    try {
      const response = await axios.post(
        "http://localhost:3001/api/generaldetails/dateformat",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // console.log(response.data);
      // console.log(selectedFile.name);
 
      setJsonData(response.data.data);
      // setAccuracy(response.data.accuracy);
      const rows = {
        filename: selectedFile.name,
        total: response.data.count + response.data.t,
        valid: response.data.count,
        invalid: response.data.t,
        accuracy: response.data.accuracy,
        errorRate: 100 - response.data.accuracy,
      }
      setTableData([rows]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/generaldetails/getdata"
        );
        setJData(response.data);
        // Process the response here
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(jsonData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "data");
    XLSX.writeFile(wb, "data.xlsx");
  };

  const handleeyedata = async (c) => {
    const data = {
      file_name: c,
    };
    // console.log(c);
    try {
      const response = await axios.post(
        "http://localhost:3001/api/generaldetails/getfiledata",
        data
      );
      setResponseData(response.data);
      console.log(response.data);
      // Process the response here
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const viewData = (c) => {
    handleeyedata(c);
    setShowModal(true);
  };

  return (
    <>
      <MainContainer>
        <center>
          <input
            className="form-control uploadBtnInput"
            id="formFile"
            style={{ height: "2.5%", width: "355px" }}
            onChange={handleFileChange}
            type="file"
            name="excelFile"
          />

          <DataTable
            value={tableData}
            style={{ width: "90%", margin: "15px" }}>
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
              field="valid"
              header="Valid Count"
              style={{ width: "15%", border: "1px solid black" }}
            ></Column>
            <Column
              field="invalid"
              header="Invalid Count"
              style={{ width: "15%", border: "1px solid black" }}
            ></Column>
            <Column
              field="accuracy"
              header="Accuracy Rate"
              style={{ width: "15%", border: "1px solid black" }}
              body={(rowData) => (
                <div>
                  {rowData.accuracy}%
                </div>
              )}
            ></Column>
            <Column
              field="errorRate"
              header="Error Rate"
              style={{ width: "25%", border: "1px solid black" }}
              body={(rowData) => (
                <div>
                  {rowData.errorRate}%
                </div>
              )}
            ></Column>
          </DataTable>
        </center>

        <div className="mt-4">
          <h2 className="text-lg font-bold mb-2">JSON Data</h2>
          {/* <p>Accuracy: {accuracy.toFixed(2)}%</p> */}
          <center>

            {jsonData.length !== 0 && (
              <>
                <DataContainer style={{ marginTop: "20px", alignItems: "center" }}>
                  <h4>Filter Table</h4>
                  <List
                    style={{ border: "1px solid #ccc", borderRadius: "5px" }}
                    height={450}
                    itemCount={jsonData.length}
                    itemSize={50}
                    width={800}
                    itemData={jsonData}
                  >
                    {TableRow}
                  </List>
                </DataContainer>
              </>
            )}
            {jsonData.length !== 0 && (
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                style={{ backgroundColor: "blue", marginTop: "20px", marginBottom: "20px" }}
                onClick={downloadExcel}
              >
                Download Excel
              </button>
            )}
          </center>
        </div>
      </MainContainer>

      {/* {jData} */}
      <div style={{ display: "flex", justifyContent: "center", height: "100%" }}>
        <div className="card" style={{ width: "85%" }}>
          <DataTable
            value={jData}
            paginator
            rows={5}
            rowsPerPageOptions={[5, 10, 25, 50]}
            tableStyle={{ minWidth: "5rem" }}
          >
            <Column field="file_name" header="file_name" style={{ width: "25%" }}></Column>
            <Column field="created_date" header="created_date" style={{ width: "25%" }}></Column>
            <Column field="accuracy" header="Accuracy" style={{ width: "25%" }}></Column>
            <Column
              field="action"
              header="View/Download"
              body={(rowData) => (
                <div className="btnCon">
                  <VisibilityIcon
                    style={{ cursor: "pointer" }}
                    onClick={() => viewData(rowData.file_name)}
                  />
                </div>
              )}
            />
          </DataTable>

          <Modal show={showModal} onHide={() => setShowModal(false)} fullscreen={true}>
            <Modal.Header closeButton>
              <Modal.Title>View Data</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {/* Table to display response data */}
              <Table striped bordered hover>
                <thead>
                  <tr>
                    {responseData.length > 0 &&
                      Object.keys(responseData[0]).map((key) => <th key={key}>{key}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {responseData.map((item, index) => (
                    <tr key={index}>
                      {Object.keys(responseData[0]).map((key, i) => (
                        <td key={i}>{item[key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
              <Button variant="primary" onClick={downloadExcel}>
                Download Excel
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default YourComponent;
