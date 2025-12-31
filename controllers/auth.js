const express = require('express');
const router = express.Router();
const passport = require('../config/ppConfig');

// import models
const { user } = require('../models');

router.get("/signup", (req, res) => {
  return res.render("auth/signup");
});

router.get("/login", (req, res) => {
  return res.render("auth/login");
});

router.get('/logout', (req, res) => {
  req.logOut(function(err, next) {
    if (err) {
      return next(err);
    }
    req.flash('success', 'Logging out... See you next time!');
    res.redirect('/');
  }); // logs the user out of the session
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  successFlash: 'Welcome back ...',
  failureFlash: 'Either email or password is incorrect' 
}));

router.post('/signup', async (req, res) => {
  // we now have access to the user info (req.body);
  const { email, name, password } = req.body; // goes and us access to whatever key/value inside of the object
  try {
    const [_user, created] = await user.findOrCreate({
        where: { email },
        defaults: { name, password }
    });

    if (created) {
        // if created, success and we will redirect back to / page
        console.log(`----- ${_user.name} was created -----`);
        const successObject = {
            successRedirect: '/',
            successFlash: `Welcome ${_user.name}. Account was created and logging in...`
        }
        // 
        passport.authenticate('local', successObject)(req, res);
    } else {
      // Send back email already exists
      req.flash('error', 'Email already exists');
      res.redirect('/auth/signup'); // redirect the user back to sign up page to try again
    }
  } catch (error) {
        // There was an error that came back; therefore, we just have the user try again
        console.log('**************Error');
        console.log(error);
        req.flash('error', 'Either email or password is incorrect. Please try again.');
        res.redirect('/auth/signup');
  }
});

router.get('/:id/edit', async (req, res) => {
  try {
    const foundUser = await user.findOne({
      where: { id: req.params.id }
    });

    if (!foundUser) {
      req.flash('error', 'User not found');
      return res.redirect('/profile');
    }

    // Check if user is editing their own profile
    if (req.user && req.user.id !== parseInt(req.params.id)) {
      req.flash('error', 'Unauthorized');
      return res.redirect('/profile');
    }

    return res.render('auth/edit-profile.ejs', { user: foundUser });
  } catch (error) {
    console.error('Error loading edit profile:', error);
    req.flash('error', 'Error loading profile');
    return res.redirect('/profile');
  }
});

router.post('/:id/edit', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    const foundUser = await user.findOne({
      where: { id: req.params.id }
    });

    if (!foundUser) {
      req.flash('error', 'User not found');
      return res.redirect('/profile');
    }

    // Check authorization
    if (req.user && req.user.id !== parseInt(req.params.id)) {
      req.flash('error', 'Unauthorized');
      return res.redirect('/profile');
    }

    // Update name and email
    foundUser.name = name;
    foundUser.email = email;

    // Update password if provided
    if (password && password.trim() !== '') {
      if (password !== confirmPassword) {
        req.flash('error', 'Passwords do not match');
        return res.redirect(`/auth/${req.params.id}/edit`);
      }
      foundUser.password = password; // Will be hashed by the model hook
    }

    await foundUser.save();

    req.flash('success', 'Profile updated successfully');
    return res.redirect('/profile');
  } catch (error) {
    console.error('Error updating profile:', error);
    req.flash('error', 'Error updating profile');
    return res.redirect(`/auth/${req.params.id}/edit`);
  }
});

module.exports = router;