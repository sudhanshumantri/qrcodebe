var qrCodeRoutes = require('./routes/qrcode');
module.exports = app => {
    console.log('came here')
    app.use('/qr-code', qrCodeRoutes);
    return app;
};
