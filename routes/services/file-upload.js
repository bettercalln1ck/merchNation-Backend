var aws = require('aws-sdk')
var multer = require('multer')
var multerS3 = require('multer-s3')
 
const config=require('../../config')

aws.config.update({
    accessKeyId : process.env.S3_KEY,
    secretAccessKey : process.env.S3_SECRET,
    region :'us-east-2'
});


const fileFilter = (req,file,cb) => {
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
    cb(null,true)
  }else{
    cb(new Error('Invalid Mime Type ,only JPEG and PNG'),false);
  }
}

var s3 = new aws.S3({})
 
var upload = multer({
  fileFilter: fileFilter,
  storage: multerS3({
    s3: s3,
    bucket: 'merchnation',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: 'TESTING'});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  })
})

module.exports=upload;