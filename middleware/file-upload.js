/**
 * Handle multi-part form data (which can contain text & bin data - JSON only works w/ text)
 * Wrap multer middleware in this middleware to config and export
 *
 */

const multer = require('multer');
const uuid = require('uuid/v1');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};

// Multer middleware config
// - what type of files to accept
// - where to store files
const fileUpload = multer({
  limits: 500000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/images');
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      // 2nd arg generates a rando filename w/ correct extension
      cb(null, uuid() + '.' + ext);
    },
    fileFilter: (req, file, cb) => {
      const isValid = !!MIME_TYPE_MAP[file.mimetype];
      let error = isValid ? null : new Error('Invalid mime type.');
      cb(error, isValid);
    }
  })
});

// export pre-configured middleware
module.exports = fileUpload;
