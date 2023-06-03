const QRCode = require('qrcode');
const {
    v1: uuidv1,
    v4: uuidv4,
} = require('uuid');
const AWS = require('aws-sdk');
const { S3_BUCKET_CONFIG } = require('../config/index');
const qrcodeSchema = require('../models/user');
class QrCodeServices {
    async generate(reqBody) {
        try {
           let userInDb = await qrcodeSchema.findOne({'phone':reqBody.phone});
           if(userInDb){
            return {
                status:false,
                msg:"For this number qr code already generated"
            }
           }
           let user = await qrcodeSchema.create({...reqBody,isScaneDone:false});
            let qrcodeBase64 = await QRCode.toDataURL(reqBody.phone);
            let s3url = await this.imageUploads3(qrcodeBase64);
            return {
                status: true,
                data: s3url,
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

    async scan(reqBody) {
        try {
           let phone = Number(reqBody.phone);
           let userDataInDb = await qrcodeSchema.findOne({'phone':phone});
           if(!userDataInDb){
            return {
                status:false,
                msg:"No records found"
            }
           } 
           if(userDataInDb.isScaneDone){
            return {
                status:false,
                msg:"This QR code is already used"
            }
           }
          await qrcodeSchema.updateOne({'phone':phone},{$set:{isScaneDone:true}});
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
    async imageUploads3(base64) {
        const { AWS_ACCESS_KEY, AWS_SECRET_KEY, S3_BUCKET } = S3_BUCKET_CONFIG;
        const base64Data = new Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        const type = base64.split(';')[0].split('/')[1];
        const s3 = new AWS.S3({
            accessKeyId: AWS_ACCESS_KEY,
            secretAccessKey: AWS_SECRET_KEY,
        });
        const uploadedImage = await s3.upload({
            Bucket: S3_BUCKET,
            Key: `${uuidv4()}.${type}`,
            Body: base64Data,
            ACL: 'public-read',
        }).promise();
        return uploadedImage.Location;
    }
}

module.exports = QrCodeServices