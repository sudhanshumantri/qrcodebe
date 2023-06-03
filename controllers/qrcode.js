const QrCodeServices = require('../services/qrcode');
const QrCodeServicesInstance = new QrCodeServices();

exports.generate = async function (req, res) {
    let response = await QrCodeServicesInstance.generate(req.body);
    return res.send(response);

}
exports.scan = async function (req, res) {
    let response = await QrCodeServicesInstance.scan(req.body);
    return res.send(response);

}