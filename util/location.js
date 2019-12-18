const API_KEY = 'AIzaSyA404my6ov-74_MZGK_Iv8M8gw1RtpbHMI';
const axios = require('axios');

const HttpError = require('../models/http-error');

const getCoordsForAddress = async address => {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
  );
  const data = response.data;

  if (!data || data.status === 'ZERO_RESULTS') {
    const error = new HttpError(
      'Could not find location for the specified address.',
      422
    );
    throw error;
  }

  // Coordinates
  return data.results[0].geometry.location;
};

module.exports = getCoordsForAddress;
