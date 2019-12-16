const uuid = require('uuid/v4');

const HttpError = require('../models/http-error');

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Garuda Wisnu Kencana Cultural Park',
    description:
      'Expansive park featuring monumental Hindu sculptures plus frequent dance performances & concerts.',
    imageUrl:
      'https://img.jakpost.net/c/2018/11/28/2018_11_28_59559_1543399591._large.jpg',
    address:
      'Jl. Raya Uluwatu, Ungasan, Kec. Kuta Sel., Kabupaten Badung, Bali 80364',
    location: {
      lat: -8.8104228,
      lng: 115.1654046
    },
    creator: 'u1'
  },
  {
    id: 'p2',
    title: 'Garuda Wisnu Kencana Cultural Park 2',
    description:
      'Expansive park featuring monumental Hindu sculptures plus frequent dance performances & concerts. 2.',
    imageUrl:
      'https://img.jakpost.net/c/2018/11/28/2018_11_28_59559_1543399591._large.jpg',
    address:
      'Jl. Raya Uluwatu, Ungasan, Kec. Kuta Sel., Kabupaten Badung, Bali 80364',
    location: {
      lat: -8.8104228,
      lng: 115.1654046
    },
    creator: 'u1'
  }
];

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find(p => p.id === placeId);

  if (!place) {
    // Forward error to next middleware
    // Note: must use next not throw if running async code
    return next(
      new HttpError("Couldn't find a place for the provided id.", 404)
    );
  }

  res.json({ place });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter(p => p.creator === userId);

  if (!places || places.length === 0) {
    return next(
      new HttpError("Couldn't find any places for the provided user id.", 404)
    );
  }

  res.json({ places });
};

const createPlace = (req, res, next) => {
  const { title, description, coordinates, address, creator } = req.body;
  const createdPlace = {
    id: uuid(),
    title,
    description,
    location: coordinates,
    address,
    creator
  };

  DUMMY_PLACES.push(createdPlace);
  res.status(201).json({ place: createdPlace }); // 201 = created
};

const updatePlace = (req, res, next) => {
  const placeId = req.params.pid;
  const { title, description } = req.body;
  const place = DUMMY_PLACES.find(p => p.id === placeId);
  const placeIdx = DUMMY_PLACES.findIndex(p => p === place);
  const updatedPlace = {
    ...DUMMY_PLACES[placeIdx],
    title,
    description
  };

  DUMMY_PLACES[placeIdx] = updatedPlace;
  res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
  res.status(200).json({ message: `Deleted place id ${placeId}` });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
