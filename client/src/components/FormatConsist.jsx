import React, { useState } from "react";
import Pincode from "./FormatConsistency/StationCode";
import CodeNumber from "./FormatConsistency/Railways";
import LatLong from "./FormatConsistency/LatLong";
import FileFormat from "./FormatConsistency/FileFormat";
import Date from "./FormatConsistency/Date";
import Pincodeformate from "./FormatConsistency/Pincodeformate";
import StateFormat from "./FormatConsistency/StateFormat";
import DistrictFormat from "./FormatConsistency/DistrictFormat";
import UnionTerritoriesFormat from "./FormatConsistency/UnionTerritoriesFormat";
import Railways from "./FormatConsistency/Railways";
import Phoneformate from "./FormatConsistency/PhoneNoFormat";

const FormatConsist = () => {
  const [selectedFormat, setSelectedFormat] = useState("Select the option");

  const handleFormatChange = (event) => {
    setSelectedFormat(event.target.value);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <select
        value={selectedFormat}
        onChange={handleFormatChange}
        style={{
          padding: "10px",
          backgroundColor: "#f7f7f7",
          color: "#333",
          border: "1px solid #ccc",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
          outline: "none",
        }}
      >
        {/* correct here for the zone and the code option for the railway zone and railway code */}
        <option value="Select the option">Select the option</option>
        <option value="FileFormat">File Format</option>
        <option value="DateFormat">Date Format</option>
        <option value="StationCode">Station Code Format</option>
        <option value="LatLong">Lat-Long Format</option>
        <option value="RailwayCode">Railway Code Format</option>
        <option value="Pincode">Pincode Format</option>
        <option value="PhoneNo">PhoneNo Format</option>
        <option value="State">State Format</option>
        <option value="District">District Format</option>
        <option value="UnionTerrorits">Union Territories Format</option>
      </select>

      {selectedFormat === "StationCode" && <Pincode />}
      {selectedFormat === "PhoneNo" && <Phoneformate />}
      {selectedFormat === "FileFormat" && <FileFormat />}
      {selectedFormat === "DateFormat" && <Date />}
      {selectedFormat === "RailwayCode" && <CodeNumber />}
      {selectedFormat === "LatLong" && <LatLong />}
      {selectedFormat === "Pincode" && <Pincodeformate />}
      {selectedFormat === "State" && <StateFormat />}
      {selectedFormat === "District" && <DistrictFormat />}
      {selectedFormat === "UnionTerrorits" && <UnionTerritoriesFormat />}
      {selectedFormat === "Railway" && <Railways />}

      
      <div className="alert alert-primary" style={{ margin: "20px 100px" }}>
        <b>Definition: </b> Format Consistency ensures that data values adhere
        to the specified format, structure and encoding rules
        <br />
      </div>
    </div>
  );
};

export default FormatConsist;
