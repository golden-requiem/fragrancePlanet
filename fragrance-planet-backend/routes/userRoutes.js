//HIS ENTIRE FILE BUILDS a router object
// that has 2 routes
//  router.post('/register')
//  router.post('/login')

const express = require('express'); // import express library for creating routes
const router = express.Router(); // create a router instance
const bcrypt = require('bcryptjs'); // import bcrypt for hashing passwords
const jwt = require('jsonwebtoken'); // import jwt for generating tokens
const db = require('../config/db'); // import database connection

// register a new user
// only post requests will active these routes
// must send post request from frontend
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body; // get username, email, and password from request body

  try {
    // check if the user already exists in the database
    const userExistsQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
    db.query(userExistsQuery, [username, email], async (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' }); // return error if there's an issue with the query
      }
      if (result.length > 0) {
        return res.status(400).json({ error: 'User already exists' }); // return error if user already exists
      }

      // hash the password before storing it in the database
      const hashedPassword = await bcrypt.hash(password, 10);

      // insert new user into the database with hashed password
      const insertUserQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      db.query(insertUserQuery, [username, email, hashedPassword], (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to register user' }); // return error if user registration fails
        }
        res.status(201).json({ message: 'User registered successfully' }); // send success message on successful registration
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' }); // handle any unexpected server errors
  }
});

// user login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body; // get username and password from request body

  try {
    // find the user in the database by username
    const findUserQuery = 'SELECT * FROM users WHERE username = ?';
    db.query(findUserQuery, [username], async (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' }); // return error if there's a database issue
      }
      if (result.length === 0) {
        return res.status(400).json({ error: 'Invalid username or password' }); // return error if the user is not found
      }

      const user = result[0]; // get the user details from the result

      // compare the provided password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid username or password' }); // return error if passwords do not match
      }

      // check if JWT_SECRET is defined in the environment variables
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET missing' }); // return error if secret is missing
      }

      // log the JWT secret for debugging (remove this in production)
      console.log("JWT_SECRET:", process.env.JWT_SECRET);

      // create a jwt token with user id and username as payload
      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
        expiresIn: '1h', // set token to expire in 1 hour
      });

      // send the token and user details in the response
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' }); // handle any unexpected server errors
  }
});

//export this router so another file can use it
// giving this router to the outisde 
module.exports = router; // export the router for use in the app

