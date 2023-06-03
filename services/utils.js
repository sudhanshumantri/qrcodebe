const {
    v1: uuidv1,
    v4: uuidv4,
} = require('uuid');
const AWS = require('aws-sdk');
const { S3_BUCKET_CONFIG } = require('../config/index');
exports.utilsService = async (base64) => {
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
