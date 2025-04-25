import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './components/Home';
import Navbar from './components/Navbar';
import Omission from './components/Omission';
import Comission from './components/Comission';
import GeneralDetails from './components/GeneralDetails';
import DomainConsistency from './components/DomainConsistency';
// import FormatConsistency from "./components/FormatConsistency";
import TemporalVal from "./components/TemporalVal";
import Format from "./components/Format";
import AccuracyTimeManagement from "./components/AccuracyTimeManagement";
import AccuracyNumber from "./components/TemporalQuality/AccuracyTime";
import Main from "./components/ThematicClassification/QuantitativeAttributes/Main";
import DateFormat from './components/DateFormat';
// import Pincodeformate from "./components/FormatConsistency/Pincodeformate";
import FormatConsist from "./components/FormatConsist";
// import StateFormat from "./components/FormatConsistency/StateFormat";
// import UnionTerritoriesFormat from "./components/FormatConsistency/UnionTerritoriesFormat";
// import DistrictFormat from "./components/FormatConsistency/DistrictFormat";
// import AccuracyInteger from "./components/AccuracyTimeMeasurement/AccuracyInteger"
// import AccuracyNumber from "./components/AccuracyTimeMeasurement/AccuracyTime"
import ThematicClassfication from "./components/ThematicClassification/ThematicClassification/Main";
import NonQuantitative from "./components/ThematicClassification/NonQuantitativeAttributes/Main";
import CheckAllFields from "./components/CheckAllFields";
// import Comission from "./components/Comission";
// import DateFormat from "./components/DateFormat";
// import DomainConsistency from "./components/DomainConsistency";
// import Format from "./components/Format";
// import FormatConsist from "./components/FormatConsist";
// import GeneralDetails from "./components/GeneralDetails";
// import Home from "./components/Home";
// import Navbar from "./components/Navbar";
// import NonQuantitative from "./components/NonQuantitative";
// import Omission from "./components/Omission";
// import TemporalVal from "./components/TemporalVal";
// import ThematicClassfication from "./components/ThematicClassfication";
import UserDefined from "./components/ThematicClassification/UserDefined";
import TempoC from "./components/TemporalQuality/Main";
import TemporalValidity from "./components/TemporalQuality/TemporalValidity";

// **************************************
import RelativePositionAcc from "./components/NewPositionAccuracy/RelativePositionAcc";
import AbsolutePositionAcc from "./components/NewPositionAccuracy/AbsolutePositionAcc";

// Conceptual ADDED

// import ConceptualConsistency from "./components/ConceptualConsistency";
import ConceptualConsistency from "./components/ConceptualConsistency.jsx";
// import LatLonStateValidation from "./components/Conceptual Consistency/LatLonStateValidation";
// import StateDistrictValidation from "./components/Conceptual Consistency/StateDistrictValidation";
// import PincodeDistrictValidation from "./components/Conceptual Consistency/PincodeDistrictValidation";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generaldetails" element={<GeneralDetails />} />
        <Route path="/omission" element={<Omission />} />
        <Route path="/comission" element={<Comission />} />
        <Route path="/domainconsistency" element={<DomainConsistency />} />
        <Route path="/formatconsistency" element={<FormatConsist />} />
        <Route path="/format" element={<Format />} />
        <Route path="/formatdate" element={<DateFormat />} />
        <Route path="/temporalval" element={<TemporalVal />} />
        <Route path="/temporalconsist" element={<TempoC />} />
        <Route path="/temporalvalid" element={<TemporalValidity />} />
        <Route path="/acctimeasurement" element={<AccuracyTimeManagement />} />
        <Route path="/activemeasurement" element={<AccuracyNumber />} />
        <Route path="/Quantitative" element={<Main />} />
        <Route
          path="/ThematicClassification"
          element={<ThematicClassfication />}
        />
        <Route path="/nonquantitative" element={<NonQuantitative />} />
        <Route path="/checkallfields" element={<CheckAllFields />} />
        <Route path="/userdefined" element={<UserDefined />} />


        {/* POSITIONAL ACCURACY */}
        <Route path="/relativepositionalaccuracy" element={<RelativePositionAcc />} />
        <Route path="/absolutepositionalaccuracy" element={<AbsolutePositionAcc />} />


        {/* Conceptual ADDED */}
        {/* <Route path="/latlon-state" element={<LatLonStateValidation />} />
        <Route path="/state-district" element={<StateDistrictValidation />} />
        <Route path="/pincode-district" element={<PincodeDistrictValidation />} /> */}
        <Route path="/Conceptual-Consistency" element={<ConceptualConsistency />} />


        {/* <Route path="/absolutepositionalaccuracy" element={<AbsolutePA />} />
        <Route path="/relativepositionalaccuracy" element={<RelativePA />} />
        <Route path="/griddedpositionalaccuracy" element={<GriddedPA />} /> */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;
