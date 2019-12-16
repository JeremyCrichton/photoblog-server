const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');

// Only forward requests to route if starts w/ 1st param
app.use('/api/places', placesRoutes);
app.use('/api/user', usersRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port} 😄`);
});
