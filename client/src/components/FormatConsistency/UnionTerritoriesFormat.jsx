// import React from 'react'
import React, { useState } from 'react';
import axios from "axios";
import { Button } from "react-bootstrap";
import { PickList } from "primereact/picklist";
import styled from 'styled-components';
import { FixedSizeList as List } from 'react-window';

const TableWrapper = styled.div`
  max-height: 450px;
  overflow-y: auto;
  width: 500px;
  height: 550px;
  border: 1px solid #ccc;
  border-radius: 10px;
`;
const MainContainer = styled.div`
  display: flex;
`;
const DataContainer = styled.div`
  position: relative;
  margin-left: 100px;
  margin-right: 15px;
  margin-bottom: 50px;
`;
const Lab = styled.div`
  background-color: red;
  color: black;
  padding: 10px;
  font-size: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  margin-top: 10px;
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
      <div style={{ width: '50px', textAlign: 'center' }}>{index + 1}</div>
      <div style={{ flex: 1, paddingLeft: '10px' }}>{item?.state}</div>
      <div style={{ width: '100px', textAlign: 'center' }}>{item?.valid}</div>
    </div>
  );
};

const UnionTerritoriesFormat = () => {
  const [source, setSource] = useState([]);
  const [target, setTarget] = useState([]);
  const [selectedFilename, setSelectedFilename] = useState("");
  const [data, setData] = useState([]);
  const [incorrect, setIncorrect] = useState('');

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
      setData(response.data.data);
      setIncorrect(
        parseFloat(((response.data.errorcount) / (response.data.validCount + response.data.errorcount)) * 100).toFixed(3)
      );
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
      </center>
      <MainContainer>
        <div style={{ display: "flex" }}>
          {data.length !== 0 && (
            <DataContainer style={{ marginTop: "42px" }}>
              <h4>Filter Table</h4>
              <Lab>
                <strong>Error Percentage: </strong>{incorrect}%
              </Lab>
              
                <List
                  height={450}
                  itemCount={data.length}
                  itemSize={50}
                  width={500}
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