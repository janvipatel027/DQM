const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const PORT = 3001;

const fs = require('fs/promises');
const path = require('path');
const xlsx = require('xlsx')
const generaldetailsRoutes = require('./routes/generalDetailsRoutes');
const omissionRoutes = require('./routes/omissionRoutes');
const domainconsistencyRoutes = require('./routes/domainConsistencyRoutes');
const formatConsistencyRoutes = require('./routes/formatConsistencyRoutes');
const comissionRoutes = require('./routes/comissionRoutes');
const temporalQualityRoutes = require('./routes/temporatQualityRoutes');
const accuracyRoutes = require('./routes/accuracyRoutes')
const PincodeformateRoute = require('./routes/PincodeformateRoute');
const PhoneNoformateRoute = require('./routes/PhoneNoFormatRoute');
const stationCodeRoute = require('./routes/stationCodeRouter')
const stateFormatRoute =require('./routes/stateFormatRoute');
const  unionTerrFormatRoute =require('./routes/unionTerrFormatRoute');
const  districtFormatRoute =require('./routes/districtFormatRouter');
const  accuracyNumberRoutes =require('./routes/accuracyNumberRoutes');
const  railwayZonesRoutes =require('./routes/railwayRoutes');
const  LatlongRoutes =require('./routes/latlongRoutes');
const  accuarcyLatLongRoutes =require('./routes/accuracyLatLongRoutes');
const  nonQuantitativeRoutes =require('./routes/nonQuantitativeRoutes');
const  confusionMatrixRoutes =require('./routes/confusionMatrixRoutes');
const  checkAllFeildsRoutes =require('./routes/checkAllFeildsRoutes');
const positionalAccuracyRoutes = require("./routes/positionalaccuracyRoutes");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());
require("dotenv").config();

app.use('/api/generaldetails', generaldetailsRoutes);
app.use('/api/omission', omissionRoutes);
app.use('/api/domainconsistency', domainconsistencyRoutes);
app.use('/api/format', formatConsistencyRoutes);
app.use('/api/comission', comissionRoutes);
app.use('/api/temporalquality', temporalQualityRoutes);
app.use('/api/accuracymeasurement', accuracyRoutes);
app.use('/api/pincodeformate', PincodeformateRoute);
app.use('/api/phoneformate', PhoneNoformateRoute);
app.use('/api/stationCode', stationCodeRoute);
app.use('/api/state',stateFormatRoute);
app.use('/api/union',unionTerrFormatRoute);
app.use('/api/district',districtFormatRoute);
app.use('/api/accuracynumber',accuracyNumberRoutes);
app.use('/api/railway',railwayZonesRoutes);
app.use('/api/latlong',LatlongRoutes);
app.use('/api/accuracylatlong',accuarcyLatLongRoutes);
app.use('/api/nonquantitative',nonQuantitativeRoutes);
app.use('/api/confusionmatrix',confusionMatrixRoutes);
app.use('/api/checkAllFeilds',checkAllFeildsRoutes);
app.use("/api/positionalaccuracy", positionalAccuracyRoutes);


// ********************************************************
const relativePositionAccRoutes = require('./routes/relativePositionAccRoutes');
app.use('/api/relativePositionAcc',relativePositionAccRoutes)


const absolutePositionAccRoutes = require('./routes/absolutePositionAccRoutes');
app.use('/api/absolutePositionAcc',absolutePositionAccRoutes)
// ********************************************************

// Conceptual ADDED
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const conceptualConsistencyRoutes = require('./routes/conceptualConsistencyroutes');
app.use("/conceptual-consistency", conceptualConsistencyRoutes);

app.post("/api/fieldnames", async (req, res) => {
  try {
    // console.log(req.body)
    const filename = req.body.filename;
    const filepath = path.join(__dirname, "uploads", filename);
    const rawData = await fs.readFile(filepath);
    // console.log(rawData);
    const data = JSON.parse(rawData);

    res.send({ field_names: Object.keys(data[0]) });
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
});

app.get("/api/view/:name", async (req, res, next) => {
  try {
    const filename = req.params.name;
    console.log(filename);

    if (!filename) {
      return res
        .status(400)
        .json({ error: "Filename is required in the request body." });
    }

    const filePath = path.join(__dirname, "./uploads", filename);

    const data = await fs.readFile(filePath, "utf8");
    const jsonData = JSON.parse(data);
    console.log(jsonData);
   
    res.status(200).json({ file_data: jsonData });
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
    next(error);
  }
});

app.get("/", (req, res) => {
  res.status(200).send("API works sccessfully");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});

