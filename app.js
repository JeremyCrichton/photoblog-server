const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const PORT = 5000;

const app = express();

// Parse any incoming request body & extract any incoming JSON data to JS and then call next
app.use(bodyParser.json());

// Staticly serve (return) requested file
app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

// Only forward requests to route if starts w/ 1st param
app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

// After all routes, if we haven't sent a response, run this middleware
app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error; // Synchronous so we can use throw
});

// Apply to every incoming request
// Runs if any middleware in front of it yields an errors
app.use((error, req, res, next) => {
  // If an error occurs and there was an image w/ the req delete file that was uploaded
  // file property is added by multer
  if (req.file) {
    // cb is called when deletion is done
    fs.unlink(req.file.path, err => {
      console.log(err);
    });
  }

  // A response has already been sent
  if (res.headerSent) {
    // return next and forward the error
    return next(error);
  }
  // If not, send an error response
  res.status(error.code || 500); // A 500 if there is no error code
  res.json({ message: error.message || 'An unknown error occurred!' }); // A generic msg if there is no message
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-l4yzk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
  )
  // If connection to db is successful, start node server
  .then(() => {
    app.listen(process.env.PORT || PORT, () => {
      console.log(`Server listening on port ${PORT} 😄`);
    });
  })
  .catch(error => {
    console.log(error);
  });
