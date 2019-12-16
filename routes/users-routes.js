const express = require('express');
const router = express.Router();

const DUMMY_USERS = [
  {
    id: 'u1',
    name: 'Jer',
    image:
      'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?cs=srgb&dl=animal-pet-cute-kitten-45201.jpg&fm=jpg',
    places: 3
  },
  {
    id: 'u2',
    name: 'Cam',
    image:
      'https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?cs=srgb&dl=animal-animal-photography-cat-104827.jpg&fm=jpg',
    places: 3
  }
];

router.get('/:uid', (req, res, next) => {
  const userId = req.params.uid;
  const user = DUMMY_USERS.find(u => u.id === userId);
  res.json({ user });
});

module.exports = router;
