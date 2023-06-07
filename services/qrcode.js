const QRCode = require('qrcode');
const {
    v1: uuidv1,
    v4: uuidv4,
} = require('uuid');
const AWS = require('aws-sdk');
var request = require('request');
const { S3_BUCKET_CONFIG, FAST2SMS_KEY, MSG_91_KEY } = require('../config/index');
const QRcodeSchema = require('../models/user');
const fs = require('fs');
const csv = require('fast-csv');
const utils = require('./utils');
class QrCodeServices {
    async generate(req, csvUrl) {
        let { file, body } = req;
        let stream = fs.createReadStream(csvUrl)
        let collectionCsv = [];
        let userToProcess = [];
        let csvFileStream = csv
            .parse()
            .on('data', function (data) {
                collectionCsv.push(data)
            })
            .on('end', function () {
                collectionCsv.shift();
                async function processData() {
                    for (const data of collectionCsv) {
                        let phone = data[0];
                        let name = data[1];
                        let role = data[2];
                        //collectionCsv.forEach(data=>{
                        let userInDb = await QRcodeSchema.findOne({ 'phone': phone });
                        if (!userInDb) {
                            let qrcodeBase64 = await QRCode.toDataURL(phone);
                            let s3url = await utils.utilsService(qrcodeBase64);
                            userToProcess.push({
                                name,
                                phone,
                                status: role,
                                qrCode: s3url
                            })
                        }
                        console.log(userInDb);
                    };
                    // console.log(userToProcess);
                    let insertRecords = await QRcodeSchema.insertMany(userToProcess);
                    userToProcess.map(users => {
                        let body = {
                            message: 'Your access has been generated.' + users.qrCode + '. Thank You.',
                            route: 'q',
                            numbers: users.phone
                        };
                        console.log('body', body);
                        request.post({
                            url: 'https://www.fast2sms.com/dev/bulkV2',
                            method: "POST",
                            headers: {
                                "content-type": "application/json",
                                "authorization": FAST2SMS_KEY
                            },
                            body,
                            json: true
                        }, function (error, response, body) {
                            if (error) {
                                console.log(error)
                            } else {
                                console.log('body', body);
                                // let token = body.Token;
                                // fs.writeFileSync(process.cwd() + '/config/vasionToken.js', token);
                                // resolve({ token: token })
                            }
                        })
                        //make the api request and get it done man

                    });
                    return ({
                        status: true
                    })
                    //here we will send the message
                    console.log('insertRecords', insertRecords);
                }
                return processData()
                fs.unlinkSync(csvUrl)
            })
        stream.pipe(csvFileStream)
    }
    async scan(reqBody) {
        try {
            console.log('reqBody', reqBody);
            let phone = Number(reqBody.phone);
            let userDataInDb = await QRcodeSchema.findOne({ 'phone': phone });
            if (!userDataInDb) {
                return {
                    status: false,
                    msg: "Invalid QR Code"
                }
            }
            if (userDataInDb.isScaneDone) {
                return {
                    status: false,
                    msg: "This QR code is already used"
                }
            }
            await QRcodeSchema.updateOne({ 'phone': phone }, { $set: { isScaneDone: true } });
            return {
                status: true,
                data: userDataInDb
            }
        } catch (error) {
            console.log(error);
            return {
                status: false,
                data: null,
                msg: "Something went wrong"
            }
        }
    }
    async generateQrCode(reqBody) {
        try {
            let userInDb = await QRcodeSchema.findOne({ 'phone': Number(reqBody.phone) });
            if (userInDb) {
                let body = {
                    message: 'Your access has been generated.' + userInDb.qrCode + '. Thank You.',
                    route: 'q',
                    numbers: userInDb.phone
                };
                // MSG_91_SDK.auth(MSG_91_KEY);
                // MSG_91_SDK.bulkSms({
                //     template_id: '64807870d6fc053ba95138e2',
                //     sender: 'PISTON',
                //     recipients: [
                //         { mobiles: userInDb.phone, VAR1: userInDb.qrCode },
                //         //   {mobiles: '9198XXXXXXX', VAR1: 'VALUE 1', VAR3: 'VALUE 3'}
                //     ]
                // }).then(({ data }) => console.log(data))
                //     .catch(err => console.error(err));
                // request.post({
                //     url: 'https://control.msg91.com/api/v5/flow/',
                //     method: "POST",
                //     headers: {
                //         "content-type": "application/json",
                //         "authkey": MSG_91_KEY
                //     },
                //     body: {
                //         "template_id": "64807870d6fc053ba95138e2",
                //         "sender": "PISTON",
                //         "recipients": [
                //             {
                //                 "mobiles": '918530484193',
                //                 // "mobiles": userInDb.phone,
                //                 "VAR1": userInDb.qrCode,

                //             },

                //         ]
                //     },
                //     json: true
                // }, function (error, response, body) {
                //     if (error) {
                //         console.log(error)
                //     } else {
                //         console.log('body', body);
                //     }
                // })
                request.post({
                    url: 'https://www.fast2sms.com/dev/bulkV2',
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        "authorization": FAST2SMS_KEY
                    },
                    body,
                    json: true
                }, function (error, response, body) {
                    if (error) {
                        console.log(error)
                    } else {
                        console.log('body', body);
                    }
                })
                return {
                    status: false,
                    msg: "QR code resent sucesfully",
                }
            }
            let qrcodeBase64 = await QRCode.toDataURL(reqBody.phone);
            let s3url = await utils.utilsService(qrcodeBase64);
            let userData = await QRcodeSchema.create({ ...reqBody, qrCode: s3url, isScaneDone: false });
            let body = {
                message: 'Your QR code has been generated. Use the link ' + userData.qrCode + '. Thank You.',
                route: 'q',
                numbers: userData.phone
            };
            request.post({
                url: 'https://www.fast2sms.com/dev/bulkV2',
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "authorization": FAST2SMS_KEY
                },
                body,
                json: true
            }, function (error, response, body) {
                if (error) {
                    console.log(error)
                } else {
                    console.log('body', body);
                }
            })
            return {
                status: true,
                msg: 'QR Code generated successfully',
                data: userData
            }
        } catch (error) {
            console.log(error);
            return {
                status: false,
                data: null,
                msg: "Something went wrong"
            }
        }
    }

}

module.exports = QrCodeServices