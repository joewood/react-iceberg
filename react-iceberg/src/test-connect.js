var AWS = require('aws-sdk');

var s3  = new AWS.S3({
    accessKeyId: 'vscode' ,
    secretAccessKey: 'password' ,
    endpoint: 'http://localhost:3000' ,
    s3ForcePathStyle: true,
    signatureVersion: 'v4'
});


s3.listBuckets( (err,data)=> {
    if (!!err) {
        console.error(err);
        return;
    }
    console.log("Data",data.Buckets)
})
// List all contents stored in the zip archive
// s3.listObjectsV2({Bucket : 'your-bucket', Prefix: 'path/to/file.zip/'}).
//     on('build', function(req) { req.httpRequest.headers['X-Minio-Extract'] = 'true'; }).
//     send(function(err, data) {
//         if (err) {
//             console.log("Error", err);
//         } else {
//             console.log("Success", data);
//         }
//     });


// // Download a file in the archive and store it in /tmp/data.csv
// var file = require('fs').createWriteStream('/tmp/data.csv');
// s3.getObject({Bucket: 'your-bucket', Key: 'path/to/file.zip/data.csv'}).
//     on('build', function(req) { req.httpRequest.headers['X-Minio-Extract'] = 'true'; }).
//     on('httpData', function(chunk) { file.write(chunk); }).
//     on('httpDone', function() { file.end(); }).
//     send();