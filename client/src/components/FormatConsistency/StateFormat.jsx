import React, { useState, useCallback } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import { PickList } from "primereact/picklist";
import { FixedSizeList as List } from "react-window"; // Virtualized list
import styled from "styled-components";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";




const MainContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DataContainer = styled.div`
  position: relative;
  margin-left: 100px;
  margin-right: 15px;
  margin-bottom: 50px;
`;

const Table1 = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ccc;
  border-radius: 8px;
`;


const TableCell = styled.td`
  padding: 10px;
  border-bottom: 1px solid #ccc;
  text-align: center;
`;



const StateFormat = () => {
  const [source, setSource] = useState([]);
  const [target, setTarget] = useState([]);
  const [selectedFilename, setSelectedFilename] = useState("");
  const [data, setData] = useState([]);
  // const [incorrect, setIncorrect] = useState("");
  const [showTable, setShowTable] = useState(false); // Controls table visibility
  const [tableData, setTableData] = useState([]);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    const formData = new FormData();
    formData.append("excelFile", selectedFile);

    try {
      const response = await axios.post("http://localhost:3001/api/generaldetails", formData);
      if (response.status === 201) {
        setSelectedFilename(response.data);
      }
    } catch (error) {
      console.error("Error:", error);
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

  const fetchStateCodes = useCallback(async () => {
    if (!selectedFilename || target.length === 0) return;

    try {
      const response = await axios.post("http://localhost:3001/api/state/check", {
        filename: selectedFilename,
        attributes: target,
      });

      const errorRate = ((response.data.errorcount / (response.data.validCount + response.data.errorcount)) * 100).toFixed(3);
      const rows = {
        filename: selectedFilename,
        total: response.data.validCount + response.data.errorcount,
        valid: response.data.validCount,
        invalid: response.data.errorcount,
        errorRate: errorRate,
      }
      setTableData([rows]);

      setData(response.data.data);
      // setIncorrect(errorRate);

      setShowTable(true); // Show table after fetching data
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [selectedFilename, target]);

  const onChange = (e) => {
    const { target } = e;
    setTarget(target.length > 1 ? [target[target.length - 1]] : target);
  };

  return (
    <div>
      <h2>State Format</h2>
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

        <div style={{ marginTop: "1%", width: "70%", display: "flex", flexDirection: "row", alignItems: "flex-start" }}>
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

        <Button onClick={fetchStateCodes} style={{ marginBottom: "50px" }}>Start Test</Button>
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
      <MainContainer>
        {showTable && data.length > 0 && ( // Table only shows after clicking "Start Test"
          <DataContainer style={{ marginTop: "42px" }}>
            <h4>Validation Results</h4>
            <>
              <List height={450} itemCount={data.length} itemSize={40} width={700}>
                {({ index, style }) => (
                  <div style={style}>
                    <Table1>
                      <tbody>
                        <tr>
                          <TableCell width={50}>{index + 1}</TableCell>
                          <TableCell width={550}>{data[index].state}</TableCell>
                          <TableCell width={200}>{data[index].valid}</TableCell>
                        </tr>
                      </tbody>
                    </Table1>
                  </div>
                )}
              </List>
            </>
          </DataContainer>
        )}
      </MainContainer>
    </div>
  );
};

export default StateFormat;