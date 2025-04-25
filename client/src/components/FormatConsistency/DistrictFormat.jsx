import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import { PickList } from "primereact/picklist";
import { FixedSizeList as List } from "react-window"; // Virtualized list for performance
import styled from "styled-components";

const TableWrapper = styled.div`
  max-height: 450px;
  overflow-y: auto;
  width: 700px;
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

const Table1 = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ccc;
  border-radius: 8px;
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

const Lab = styled.div`
  background-color: red;
  color: black;
  padding: 10px;
  font-size: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  margin-top: 10px;
`;

const TableBodyRow = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }
  &:hover {
    background-color: #ddd;
  }
`;

const DistrictFormat = () => {
  const [source, setSource] = useState([]);
  const [target, setTarget] = useState([]);
  const [selectedFilename, setSelectedFilename] = useState("");
  const [data, setData] = useState([]);
  const [incorrect, setIncorrect] = useState("");
  const [showTable, setShowTable] = useState(false);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("excelFile", selectedFile);

    try {
      const response = await axios.post("http://localhost:3001/api/generaldetails", formData);
      if (response.status === 201) {
        setSelectedFilename(response.data);
      }
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

  const fetchDistrictCodes = useCallback(async () => {
    if (!selectedFilename || target.length === 0) return;

    try {
      const response = await axios.post("http://localhost:3001/api/district/check", {
        filename: selectedFilename,
        attributes: target,
      });

      setData(response.data.data);
      setIncorrect(((response.data.errorcount / (response.data.validCount + response.data.errorcount)) * 100).toFixed(3));

      setShowTable(true);
    } catch (error) {
      console.error("Error fetching district codes:", error);
    }
  }, [selectedFilename, target]);

  const onChange = (e) => {
    setTarget(e.target.length > 1 ? [e.target[e.target.length - 1]] : e.target);
  };

  return (
    <div>
      <h2>District Format</h2>
      <center>
        <input style={{

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

        <Button onClick={fetchDistrictCodes} style={{ marginBottom: "50px" }}>Start Test</Button>
      </center>

        <MainContainer>
      {showTable && data.length > 0 && (
          <DataContainer>
            <h4>Validation Results</h4>
            <Lab>
              <strong>Error Percentage: </strong>{incorrect}%
            </Lab>

 
              <List height={450} itemCount={data.length} itemSize={40} width={700}>
                {({ index, style }) => (
                  <div style={style}>
                    <Table1>
                      <tbody>
                        <tr>
                        <TableCell width={50}>{index + 1}</TableCell>
                          <TableCell width={550}>{data[index].district}</TableCell>
                          <TableCell width={200}>{data[index].valid}</TableCell>
                        </tr>
                      </tbody>
                    </Table1>
                  </div>
                )}
              </List>

          </DataContainer>
      )}
      </MainContainer>
    </div>
  );
};

export default DistrictFormat;