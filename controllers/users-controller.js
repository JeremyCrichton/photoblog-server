const uuid = require('uuid/v4');

const HttpError = require('../models/http-error');

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

const signup = (req, res, next) => {
  const { name, email, password } = req.body;

  const userExists = DUMMY_USERS.find(u => u.email === email);
  if (userExists) {
    return next(new HttpError("Can't create user, email already exists.", 422));
  }

  const newUser = { id: uuid(), name, email, password };

  DUMMY_USERS.push(newUser);
  res.status(201).json({ user: newUser });
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
