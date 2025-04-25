const phoneServices = require("../services/phoneNoFormatService");

exports.phoneAuto = async (req, res, next) => {
  try {
    console.log(req.body);
    const result = await phoneServices.phoneAuto(
      req.body.filename,
      req.body.attributes
    );
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.createPhoneLogs = async (req, res, next) => {
  try {
    const phoneData = req.body;
    const result = await phoneServices.createNewPhoneLog(phoneData);
    res.status(201).json({ message: "Log entry created successfully" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.getPhoneLogs = async (req, res, next) => {
  try {
    const result = await phoneServices.getPhoneLogs();
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
};
