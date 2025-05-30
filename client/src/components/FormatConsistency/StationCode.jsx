// import React from 'react'
import React, { useState, useEffect } from 'react';
import axios from "axios";
import styled from 'styled-components';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Swal from 'sweetalert2';
import { Modal, Button } from "react-bootstrap";
import * as XLSX from "xlsx";
// import * as FileSaver from "file-saver";
import { PickList } from "primereact/picklist";

const TableWrapper = styled.div`
  max-height: 450px; /* Set the height you want for the scrollable area */
  overflow-y: auto;
  width:500px;
  height:550px;
  border: 1px solid #ccc; /* Add border to TableWrapper */
  border-radius: 10px;
`;
const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

// const SectionContainer = styled.div`
//   // width: 19%;
//   margin-right:15px;
// `;

const DataContainer = styled.div`
  position: relative;
  margin-left:100px;
  margin-right:15px;
  margin-bottom:50px;


`;

// const Dropdown = styled.select`
//   padding: 10px;
//   font-size: 16px;
//   border-radius: 8px;
//   width:150px;
//   margin-bottom:10px
// `;

// const Option = styled.option`
//   padding: 10px;
//   font-size: 16px;

//   border-radius: 8px;
// `;

const Table1 = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ccc; 
  border-radius:8px;
 

`;

const TableHeader = styled.th`
  background-color: #f2f2f2;
  padding: 10px;
  font-weight: bold;
  text-align: left;
`;

const TableCell = styled.td`
  padding: 10px;
  border-bottom: 1px solid #ccc;
  text-align: left;
`;

const TableBodyRow = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }
  &:hover {
    background-color: #ddd;
  }
`;

// const ErrorLabel = styled.div`
//   background-color: #ff4d4d;
//   color: white;
//   padding: 10px;
//   font-size: 15px;
//   border-radius: 8px;
// `;
const Lab = styled.div`
  background-color: red;
  color: black;
  padding: 10px;
  font-size: 15px;
  border-radius: 8px;
  margin-bottom:10px;
  margin-top:10px;
`;

// const Button1 = styled.button`
//   background-color: #4CAF50;
//   border: none;
//   color: white;
//   padding: 10px 20px;
//   font-size: 15px;
//   cursor: pointer;
//   border-radius: 8px;
// `;
const StationCode = () => {
  const [source, setSource] = useState([]);
  const [target, setTarget] = useState([]);
  const [selectedFilename, setSelectedFilename] = useState("");
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [incorrect, setincorrect] = useState('');
  
  const [tableData1, setTableData1] = useState([]);
  // const [keys, setKeys] = useState([]);
  const [Ref, setRef] = useState(false);
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    const formData = new FormData();
    formData.append("excelFile", selectedFile);

    try {
      const response = await axios.post("http://localhost:3001/api/generaldetails", formData);
      if (response.status === 201) {
        setSelectedFilename(response.data);
        console.log(response.data);
        
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert(error.response.data.message);
      }
      console.error("Error:", error);
    }
  };

  const fetchFieldNames = async () => {
    try {

      if (selectedFilename) {
        console.log(selectedFilename);
        const response = await axios.post(
          "http://localhost:3001/api/fieldnames",
          { filename: selectedFilename }
        );
        console.log(response.data.field_names);
        const fieldNames = response.data.field_names.map((fieldName) => ({
          label: fieldName,
          value: fieldName,
        }));
        setSource(fieldNames);
      } else {
        console.error("No filename selected.");
      }
    } catch (error) {
      console.error("Error fetching field names:", error);
    }
  };
  const attributeSelected = () => {
    fetchStationCode();
  }
  const onChange = (e) => {
    const { source, target } = e;

    // Check if exactly one item is selected in the target list
    if (target.length === 1) {
      setTarget(target);
    } else {
      // If not exactly one item is selected, keep only the last selected item
      setTarget(target.length > 1 ? [target[target.length - 1]] : []);
    }
  };

  const fetchStationCode = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/stationCode/selectedCols',
        {
          filename: selectedFilename,
          attributes: target,
        }
      )
      console.log(response.data);

      const errorRate = parseFloat((response.data.errorcount / (response.data.validCount + response.data.errorcount)) * 100).toFixed(3);
      setincorrect(errorRate);
      const rows = {
        filename: selectedFilename,
        total: response.data.validCount + response.data.errorcount,
        valid: response.data.validCount,
        invalid: response.data.errorcount,
        errorRate: errorRate,
      }
      setTableData1([rows]);
      setData(response.data.data);


    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const viewData = async () => {
    try {
      setShowModal(true); // Show modal after receiving the response
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };
  const handleSave = async () => {

    // console.log(getCurrentDateTime())
    const d = {
      // confidence_level : confidenceLevel*100,

      error_percentage: incorrect,
      filename: selectedFilename,
      created_time: getCurrentDateTime()
    }
    console.log(d)

    try {
      // const response = await axios.post('http://localhost:3001/api/stationCode/insertlog', d);
      // Show success message using SweetAlert
      console.log(Ref)
      setRef(Ref === true ? false : true);
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Data has been successfully inserted.',
      });

    } catch (error) {
      // Show error message using SweetAlert
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong!',
      });
      console.error('Error:', error);
    }
  }
  const fetchtableData = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/stationCode/getlogs');
      setTableData(response.data);
    }
    catch (err) {
      console.error(err);
    }
  }
  useEffect(() => {
    fetchtableData()
  }, [Ref])

  const downloadTableData = () => {
    const fileName = "download"
    const worksheet = XLSX.utils.json_to_sheet(tableData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Write workbook to binary string
    const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });

    // Convert binary string to Blob
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Create download link
    const downloadLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    downloadLink.setAttribute('href', url);
    downloadLink.setAttribute('download', `${fileName}.xlsx`);

    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Clean up
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);


  };

  return (
    <div>

      <h2>Station code</h2>
      <center>
        <input
          style={{

            height: "50px",

            width: "300px",

            border: "1px solid #ccc",

            borderRadius: "5px",

            padding: "8px",

            fontSize: "16px",

          }}
          onChange={handleFileChange}
          type="file"
          name="excelFile"
        />
        <br />
        <br />
        <Button onClick={fetchFieldNames}>Read Dataset</Button>

        <div
          style={{
            marginTop: "1%",
            width: "70%",
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: "1", marginRight: "10px" }}>
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
        <Button onClick={attributeSelected} style={{ marginBottom: "50px" }}>start Test</Button>

        <DataTable
          value={tableData1}
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
        <MainContainer>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {data.length !== 0 ?
              <DataContainer
                style={{ marginTop: "42px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <h4 style={{ width: "45%" }}>Filter Table</h4>
                  <button1 style={{ marginRight: "5rem", marginBottom: "1rem", backgroundColor: "#4CAF50", border: "none", color: "white", padding: "10px 20px", fontSize: "15px", cursor: "pointer", borderRadius: "8px" }} onClick={handleSave}>Save</button1>

                </div>


                <TableWrapper>
                  <Table1>
                    <thead>
                      <tr>
                        <TableHeader>Sr No.</TableHeader>
                        <TableHeader>Station Code</TableHeader>
                        <TableHeader>Valid/Invalid</TableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item, index) => (
                        <TableBodyRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item?.stationCode}</TableCell>
                          <TableCell>{item?.valid}</TableCell>
                        </TableBodyRow>
                      ))}
                    </tbody>
                  </Table1>
                </TableWrapper>
              </DataContainer>
              : <></>}
            <DataContainer
              style={{ marginTop: "42px" }}
            >
              <h4>DataBase</h4>
              <DataTable
                value={tableData}
                style={{ marginTop: "10px", border: "1px solid black", marginBottom: "20px" }}
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25, 50]}
              // tableStyle={{ width:"500px",height:"400px"}}
              >
                <Column
                  field="filename"
                  header="FileName"
                  style={{ width: "25%" }}
                ></Column>
                <Column
                  field="error_percentage"
                  header="Error Percentage(in%)"
                  style={{ width: "25%" }}
                ></Column>


                <Column

                  header="View/Download"
                  body={(rowData) => (
                    <div className="btnCon">
                      <VisibilityIcon
                        style={{ cursor: "pointer" }}
                        onClick={viewData}
                      />
                    </div>
                  )}
                />

              </DataTable>
            </DataContainer>
          </div>

        </MainContainer>

        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          fullscreen={true}
        >
          <Modal.Header closeButton>
            <Modal.Title>View Data</Modal.Title>


          </Modal.Header>
          <Modal.Body>
            <DataTable
              value={tableData}
              style={{ marginTop: "10px", marginLeft: "10px", width: "60%", border: "1px solid black", marginBottom: "20px" }}
              tableStyle={{ minWidth: "5rem" }}
            >
              <Column
                field="filename"
                header="filename"
                style={{ width: "25%" }}
              ></Column>
              <Column
                field="error_percentage"
                header="Error Percentage(in%)"
                style={{ width: "25%" }}
              ></Column>
              <Column
                field="created_time"
                header={
                  <>
                    Created At <br /> (YYYY-MM-DD HH:MM:SS)
                  </>
                }
                style={{ width: "25%" }}
              ></Column>


            </DataTable>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>

            <Button variant="primary" onClick={downloadTableData}>
              Download xlsx
            </Button>
          </Modal.Footer>
        </Modal>

      </center>


    </div>
  )
}

export default StationCode