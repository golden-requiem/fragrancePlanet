require('dotenv').config(); // load environment variables from .env file
const express = require('express'); // import express for creating the server
const dotenv = require('dotenv'); // import dotenv to use environment variables
const path = require('path'); // import path for working with file paths
const cors = require('cors'); // import cors to handle cross-origin requests

// import route handlers for colognes, users, favorites, and recommendations
const cologneRoutes = require('./routes/cologneRoutes'); 
const userRoutes = require('./routes/userRoutes');
 // node.js opens routes/userRoutes.js
 // runs the file
 // sees this module.exports = router and returns the router object
 // stores inside userRoutes variable
 // so now, userRoutes = router from userRoutes.js

// reads it, gets whatevere is exported from router (module.exports = router)
// stores in userRoutes (this one: const userRoutes)


const favoriteRoutes = require('./routes/favoritesRoutes'); 
const recommendationRoutes = require('./routes/recommendationRoutes'); 

// import error handling middleware
const errorHandler = require('./middleware/errorHandler'); 
// import authentication middleware to protect routes with JWT
const authenticateToken = require('./middleware/authMiddleware');

dotenv.config(); // load environment variables
const app = express(); // create an express application instance

// use cors middleware to allow requests from frontend
app.use(cors({
  origin: 'http://localhost:3000', // specify frontend origin
}));

app.use(express.json()); // middleware to parse incoming json requests

// serve static images from the public/images directory
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// setup routes for handling cologne-related operations
app.use('/api/colognes', cologneRoutes);

// setup routes for user registration and login
// mounting 
app.use('/api/users', userRoutes); 
// whenever a request starts with /api/users, 
// send it to userRoutes router
// POST /api/users/register -> hits router.post('/register')
// when router says router.post('/register') => full path:
//    /api/users + /register = /api/users/register

// /api/users/register goes to router.post('/register)

// setup routes for adding/removing favorites (protected by jwt authentication)
app.use('/api/favorites', authenticateToken, favoriteRoutes);

// setup routes for generating recommendations (protected by jwt authentication)
app.use('/api/recommendations', authenticateToken, recommendationRoutes);

// default route for the root url
app.get('/', (req, res) => {
  res.send('Welcome to Fragrance Planet API'); // send a welcome message
});

// use error handling middleware to handle errors globally (placed last)
app.use(errorHandler);

// set the port for the server to listen on
const PORT = process.env.PORT || 5000;

// start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // log that the server is running
});
