const express = require('express');
const cors = require('cors');
const createError = require('http-errors');
const mongoose = require('mongoose');
const bodyParcer = require('body-parser');
const {MONGODB_CONFIG} = require('./config/index'); 
const qrCodeRoutes = require('../qrCodeBE/routes/qrcode');
// Database connection 
mongoose
  .connect(MONGODB_CONFIG.MONGODB_STAGING)
  .then((x) => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch((err) => {
    console.error('Error connecting to mongo', err.reason)
  });

const app = express();
app.use(bodyParcer.json());
app.use(bodyParcer.urlencoded({extended : true}));
app.use(cors());
app.use('/qr-code',qrCodeRoutes);


const PORT = process.env.PORT || 8000 ;
 app.listen(PORT, ()=>{
    console.log('connected to port ----------',PORT);
});

app.use((req,res,next)=>{
    next(createError(404));
});

app.use((err,req,res,next)=>{
    console.log(err.message);
    if(!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
});