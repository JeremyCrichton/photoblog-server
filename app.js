const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

// Parse any incoming request body & extract any incoming JSON data to JS and then call next
app.use(bodyParser.json());

// Only forward requests to route if starts w/ 1st param
app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

// After all routes, if we haven't sent a response, run this middleware
app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error; // Synchronous so we can use throw
});

// Apply to every incoming request
// If 4 params are provided, express treats this as an error handling middleware
// Runs if any middleware in front of it yields an errors
app.use((error, req, res, next) => {
  // A response has already been sent
  if (res.headerSent) {
    // return next and forward the error
    return next(error);
  }
  // If not, send an error response
  res.status(error.code || 500); // A 500 if there is no error code
  res.json({ message: error.message || 'An unknown error occurred!' }); // A generic msg if there is no message
});

app.listen(port, () => {
  console.log(`Server listening on port ${port} 😄`);
});
