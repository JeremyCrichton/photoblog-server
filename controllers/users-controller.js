const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const DUMMY_USERS = [
  {
    id: 'u1',
    name: 'Jer',
    email: 'jer@jer.com',
    password: 'jer123'
  },
  {
    id: 'u2',
    name: 'Cam',
    email: 'cam@cam.com',
    password: 'cam123'
  }
];

const getUsers = (req, res, next) => {
  const users = DUMMY_USERS;
  res.json({ users });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }

  const { name, email, password, places } = req.body;

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
    places
  });

  try {
    await newUser.save();
  } catch (error) {
    return next(new HttpError('Signup failed.', 500));
  }

  res.status(201).json({ user: newUser.toObject({ getters: true }) });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  const user = DUMMY_USERS.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return next(new HttpError("Can't find user", 401));
  }

  res.status(200).json({ user });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
