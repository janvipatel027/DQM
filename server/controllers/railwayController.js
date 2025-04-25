const railwayService = require('../services/railwayServices');

exports.check = async (req, res, next) => {
    try {
        console.log(req.body);
        const result = await railwayService.SelectedCode(req.body.filename, req.body.attributes);
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.insertData = async (req, res, next) => {
    try {
        console.log(req.body);
        const result = await railwayService.createLog(req.body);
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        next(err);
    }
};

exports.getLogs = async (req, res, next) => {
    try {
        const result = await railwayService.getLogs();
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        next(err);
    }
};