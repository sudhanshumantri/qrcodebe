const QrCodeServices = require('../services/qrcode');
const QrCodeServicesInstance = new QrCodeServices();

exports.generate = async function (req, res) {
    let filePath = process.cwd() + '/uploads/' + req.file.filename;
    console.log('filePath', process.cwd());
    let response = await QrCodeServicesInstance.generate(req, filePath);
    return res.send(response);

}
exports.scan = async function (req, res) {
    let response = await QrCodeServicesInstance.scan(req.body);
    return res.send(response);

}
exports.ok = async function (req, res) {
    return res.send(
        'OK');

}
exports.generateQrCode = async function (req, res) {
    let response = await QrCodeServicesInstance.generateQrCode(req.body);
    return res.send(response);

}