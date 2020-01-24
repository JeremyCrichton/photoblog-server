const fs = require('fs');

const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    const err = new HttpError(
      'Something went wrong, could not find a place.',
      500
    );
    return next(err);
  }

  if (!place) {
    return next(
      new HttpError("Couldn't find a place for the provided id.", 404)
    );
  }

  // Convert to normal JS obj
  // {getters:true} adds id property to the created object (so we get an id property w/out the leading _ as well)
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let userWithPlaces;

  try {
    userWithPlaces = await User.findById(userId).populate('places');
  } catch (error) {
    return next(
      new HttpError('Something went wrong, could not find any places.', 500)
    );
  }

  if (!userWithPlaces || userWithPlaces.length === 0) {
    return next(
      new HttpError("Couldn't find any places for the provided user id.", 404)
    );
  }

  res.json({
    places: userWithPlaces.places.map(place =>
      place.toObject({ getters: true })
    )
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description, address } = req.body;

  let coordinates;

  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator: req.userData.userId // We get this in the check-auth middleware
  });

  let user;

  // Check if user id provided exists already
  try {
    user = await User.findById(req.userData.userId);
  } catch (error) {
    return next(new HttpError('Creating place failed, please try again', 500));
  }

  if (!user) {
    return next(new HttpError('Could not find user for provided id', 404));
  }

  // Use a session so if any actions aren't successful they are all rolled back
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    const err = new HttpError('Creating place failed, please try again!', 500);
    return next(err);
  }

  res.status(201).json({ place: createdPlace }); // 201 = created
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }

  const placeId = req.params.pid;
  const { title, description } = req.body;

  let place;

  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(
      new HttpError('Something went wrong, could not update place.', 500)
    );
  }

  // Send an error if current user did not create this place
  if (place.creator.toString() !== req.userData.userId) {
    return next(new HttpError('You are not allowed to edit this place.', 401));
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    return next(
      new HttpError('Something went wrong, could not update place', 500)
    );
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;

  try {
    // use populate to get the full user object
    place = await Place.findById(placeId).populate('creator');
  } catch (error) {
    return next(
      new HttpError('Something went wrong (1), could not delete place.', 500)
    );
  }

  if (!place) {
    next(new HttpError('Could not find place associated with this ID.'));
  }

  if (place.creator.id !== req.userData.userId) {
    return next(
      new HttpError('You are not allowed to delete this place.', 401)
    );
  }

  const imagePath = place.image;

  // Delete from DB
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await Place.deleteOne(place, { session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    return next(
      new HttpError('Something went wrong (2), could not delete place.', 500)
    );
  }

  // Delete from FS
  fs.unlink(imagePath, err => {
    console.log(err);
  });

  res.status(200).json({ message: `Deleted place id ${placeId}` });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
