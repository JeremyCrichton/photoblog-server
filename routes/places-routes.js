const express = require('express');
const router = express.Router();

const DUMMY_PLACES = [
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

router.get('/:pid', (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find(p => p.id === placeId);

  if (!place) {
    return res
      .status(404)
      .json({ message: 'Could not find a place for the provided id.' });
  }

  res.json({ place });
});

router.get('/user/:uid', (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter(p => p.creator === userId);

  if (places.length === 0) {
    return res
      .status(404)
      .json({ message: 'Could not find a place for the provided user id.' });
  }

  res.json({ places });
});

module.exports = router;
