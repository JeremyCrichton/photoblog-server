const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find({}, '-password');
  } catch (error) {
    throw new HttpError('Something went wrong, could not get Users', 500);
  }

  res.json(users.map(user => user.toObject({ getters: true })));
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }

  const { name, email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email });
  } catch (error) {
    return next(new HttpError('Signup failed, please try again.', 500));
  }

  if (existingUser) {
    return next(
      new HttpError('User already exists, please login instead.', 422)
    );
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError('Could not create user, please try again.'));
  }

  const newUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: []
  });

  try {
    await newUser.save();
  } catch (error) {
    return next(new HttpError('Signup failed.', 500));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email }, // what to return
      'supersecret_dont_share', // private key (string that only server knows)
      { expiresIn: '1h' } // config options
    );
  } catch (error) {
    return next(new HttpError('Signup failed.', 500));
  }

  res.status(201).json({ userId: newUser.id, email: newUser.email, token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email });
  } catch (error) {
    return next(new HttpError('Login failed, please try again.', 500));
  }

  if (!existingUser) {
    return next(
      new HttpError('Invalid login credentials. Could not log in.', 403)
    );
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    // Server-side error, something went wrong during comparison - doesn't mean invalid credentials
    return next(
      new HttpError(
        'Could not log you in, please check your credentials and try again.'
      )
    );
  }

  if (!isValidPassword) {
    return next(
      new HttpError('Invalid login credentials. Could not log in.', 403)
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      'supersecret_dont_share',
      { expiresIn: '1h' }
    );
  } catch (error) {
    return next(new HttpError('Login failed.', 500));
  }

  res.status(200).json({
    userId: existingUser.id,
    email: existingUser.email,
    token
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
