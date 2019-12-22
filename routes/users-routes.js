const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const usersController = require('../controllers/users-controller');
const fileUpload = require('../middleware/file-upload');

router.get('/', usersController.getUsers);

router.post(
  '/signup',
  // single method gives us access to single middleware, used to retrieve a single file
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
