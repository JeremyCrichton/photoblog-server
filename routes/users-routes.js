const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const usersController = require('../controllers/users-controller');
const fileUpload = require('../middleware/file-upload');

router.get('/', usersController.getUsers);

router.post(
  '/signup',
  // Use multer middleware which is wrapped, configured, and exported as our own fileUpload middlware
  // single method gives us access to single middleware on the exported object frommulter, which is used to retrieve a single file
  // 'image' is the name of key of the incoming request
  fileUpload.single('image'),
  [
    check('name')
      .not()
      .isEmpty(),
    check('email')
      .normalizeEmail()
      .isEmail(),
    check('password').isLength({ min: 6 })
  ],
  usersController.signup
);

router.post('/login', usersController.login);

module.exports = router;
