import React, { useState } from "react";
import LatLonStateValidation from "./Conceptual Consistency/LatLonStateValidation";
import StateDistrictValidation from "./Conceptual Consistency/StateDistrictValidation";
import PincodeDistrictValidation from "./Conceptual Consistency/PincodeDistrictValidation";

const ConceptualConsistency = () => {
  const [selected, setSelected] = useState("Select the option");

  const handleChange = (event) => {
    setSelected(event.target.value);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <select
        value={selected}
        onChange={handleChange}
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
        <option value="LatLonStateValidation">Lat-Lon & State Validation</option>
        <option value="StateDistrictValidation">State & District Validation</option>
        <option value="PincodeDistrictValidation">Pincode & District Validation</option>
      </select>

      {selected === "LatLonStateValidation" && <LatLonStateValidation />}
      {selected === "StateDistrictValidation" && <StateDistrictValidation />}
      {selected === "PincodeDistrictValidation" && <PincodeDistrictValidation />}
      
    </div>
  );
};

export default ConceptualConsistency;