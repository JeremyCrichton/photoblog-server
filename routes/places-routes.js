const express = require('express');
const { check } = require('express-validator');

const placesControllers = require('../controllers/places-controller');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlacesByUserId);

/**
 *  ROUTE PROTECTION
 * - Requests travel through middlewares from top to bottom
 * - The above routes are accessible by any request
 * - Here we create a middleware to check for a valid token
 *   - if invalid, block the request and stop request from continuing to other routes
 */

// Don't execute checkAuth, just pass a pointer to use so checkAuth gets registered as a middleware
// all routes after this can only be accessed w/ a valid token
router.use(checkAuth);

// Any post request to /api/places
router.post(
  '/',
  fileUpload.single('image'), // look for image in body w/ key 'image'
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address')
      .not()
      .isEmpty()
  ],
  placesControllers.createPlace
);

router.patch(
  '/:pid',
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  placesControllers.updatePlace
);

router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;
