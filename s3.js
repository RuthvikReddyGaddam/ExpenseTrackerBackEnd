const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

//create an S3 bucket in AWS console with default settings
//create a user 
//create a custom s3 policy which gives get,put and delete object access andattach policy to user
//create an access key and provide the access key and secret access key in .env file 
//provide region of s3 bucket and name of bucket in .env file

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: bucketRegion

})

function randomImageName(bytes = 32) { return crypto.randomBytes(bytes).toString('hex'); }

const uploadToS3 = async (image, type) => {

    imageName = randomImageName();
    const params = {
        Bucket: bucketName,
        Key: imageName,
        Body: image,
        ContentType: type,
    }
    const command = new PutObjectCommand(params);
    await s3.send(command);
    return imageName;
}

const getImageFromS3 = async (image) => {
    const getObjectParams = {
        Bucket: bucketName,
        Key: image
    }

    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return url;
}

const deleteFromS3 = async (image) => {
    let getObjectParams = {
        Bucket: bucketName,
        Key: image
    }
    const command = new DeleteObjectCommand(getObjectParams);
    await s3.send(command);
}

exports.uploadToS3 = uploadToS3;
exports.getImageFromS3 = getImageFromS3;
exports.deleteFromS3 = deleteFromS3;
