var express = require('express');
var path = require('path');
const cors = require('cors');
const { MONGODB_CONFIG } = require('./config/index');
const bodyParcer = require('body-parser');
// const qrCodeRoutes = require('../qrCodeBE/routes/qrcode');
var mongoose = require('mongoose');
// Load environment variables from .env file
//dotenv.load();
var api = require('./loadRoutes');
var app = express();
mongoose
    .connect(MONGODB_CONFIG.MONGODB_STAGING, { useNewUrlParser: true, useUnifiedTopology: true, })
    //.connect(process.env.MONGODB_STAGING,{ useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connection successful.');
    })
    .catch(err => {
        console.log(err);
        console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
        process.exit(1);
    });

app.set('port', process.env.PORT || 8000);
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb', }));
app.use(express.static(path.join(__dirname, 'build')));
//cross-origin handler
var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Content-Length, X-Requested-With'
    );
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.sendStatus(200);
    } else {
        next();
    }
};
app.use(allowCrossDomain);
api(app);
//app.use('/qr-code', qrCodeRoutes);
process.on('uncaughtException', function (err) {
    console.error(err.toString());
    console.log("Node NOT Exiting...");
});
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log('connected to port ----------', PORT);
});

// app.listen(app.get('port'), function () {
//     console.log('Express server listening on port ' + app.get('port'));
// });

module.exports = app;
