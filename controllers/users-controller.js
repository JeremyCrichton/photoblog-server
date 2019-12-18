const { validationResult } = require('express-validator');

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

  const newUser = new User({
    name,
    email,
    image:
      'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?cs=srgb&dl=animal-pet-cute-kitten-45201.jpg&fm=jpg',
    password,
    places: []
  });

  try {
    await newUser.save();
  } catch (error) {
    return next(new HttpError('Signup failed.', 500));
  }

  res.status(201).json({ user: newUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email });
  } catch (error) {
    return next(new HttpError('Login failed, please try again.', 500));
  }

  if (!existingUser || existingUser.password !== password) {
    // console.log(existingUser.password, password);
    return next(
      new HttpError('Invalid login credentials. Could not log in.', 401)
    );
  }

  res.status(200).json({ message: 'Logged in' });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
