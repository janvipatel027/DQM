// import React from 'react'
import React, { useState } from 'react';
import axios from "axios";
import { Button } from "react-bootstrap";
import { PickList } from "primereact/picklist";
import styled from 'styled-components';
import { FixedSizeList as List } from 'react-window';
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

const TableRow = ({ index, style, data }) => {
  const item = data[index];
  return (
    <div style={{
      ...style,
      display: 'flex',
      padding: '10px',
      borderBottom: '1px solid #ccc',
      backgroundColor: index % 2 === 0 ? '#f2f2f2' : 'white',
      textAlign: 'left',
      justifyContent: 'space-between'
    }}>
      <div style={{ width: '70px', textAlign: 'center' }}>{index + 1}</div>
      <div style={{ width: '520', flex: 1, paddingLeft: '10px' }}>{item?.state}</div>
      <div style={{ width: '200px', textAlign: 'center' }}>{item?.valid}</div>
    </div>
  );
};

const UnionTerritoriesFormat = () => {
  const [source, setSource] = useState([]);
  const [target, setTarget] = useState([]);
  const [selectedFilename, setSelectedFilename] = useState("");
  const [data, setData] = useState([]);
  // const [incorrect, setIncorrect] = useState('');
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
      if (error.response && error.response.status === 400) {
        alert(error.response.data.message);
      }
      console.error("Error:", error);
    }
  };

  const fetchFieldNames = async () => {
    try {
      if (selectedFilename) {
        const response = await axios.post(
          "http://localhost:3001/api/fieldnames",
          { filename: selectedFilename }
        );
        const fieldNames = response.data.field_names.map((fieldName) => ({
          label: fieldName,
          value: fieldName,
        }));
        setSource(fieldNames);
      }
    } catch (error) {
      console.error("Error fetching field names:", error);
    }
  };

  const attributeSelected = () => {
    fetchStationCode();
  };

  const onChange = (e) => {
    const { source, target } = e;
    setTarget(target.length > 1 ? [target[target.length - 1]] : target);
  };

  const fetchStationCode = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/union/check', {
        filename: selectedFilename,
        attributes: target,
      });
      const errorRate = parseFloat((response.data.errorcount / (response.data.validCount + response.data.errorcount)) * 100).toFixed(3);
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
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div>
      <h2>Union Territories Format</h2>
      <center>
        <input
          style={{ height: "50px", width: "300px", border: "1px solid #ccc", borderRadius: "5px", padding: "8px", fontSize: "16px" }}
          onChange={handleFileChange}
          type="file"
          name="excelFile"
        />
        <br /><br />
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
        <Button onClick={attributeSelected} style={{ marginBottom: "50px" }}>Start Test</Button>
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
        <div style={{ display: "flex" }}>
          {data.length !== 0 && (
            <DataContainer style={{ marginTop: "42px" }}>
              <h4>Filter Table</h4>
             
                <List
                  height={450}
                  itemCount={data.length}
                  itemSize={50}
                  width={800}
                  itemData={data}
                >
                  {TableRow}
                </List>
              
            </DataContainer>
          )}
        </div>
      </MainContainer>
    </div>
  );
};

export default UnionTerritoriesFormat;