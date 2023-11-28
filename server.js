require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('./config/ppConfig');
const isLoggedIn = require('./middleware/isLoggedIn');

// environment variables
SECRET_SESSION = process.env.SECRET_SESSION;

app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(layouts);

app.use(flash());            // flash middleware

app.use(session({
  secret: SECRET_SESSION,    // What we actually will be giving the user on our site as a session cookie
  resave: false,             // Save the session even if it's modified, make this false
  saveUninitialized: true    // If we have a new session, we save it, therefore making that true
}));

// add passport
app.use(passport.initialize());

app.use(passport.session());

app.use((req, res, next) => {
  console.log(res.locals);
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});

app.use('/auth', require('./controllers/auth'));
// Add this below /auth controllers

app.get('/', (req, res) => {
  res.render('index.ejs', { name: 'Animation_Cloud' });
})

app.get('/auth/login', (req, res) => {
  res.render('login.ejs');
})

app.get('/auth/signup', (req, res) => {
  res.render('signup.ejs');
})

app.get('/profile', isLoggedIn, (req, res) => {
  const { id, name, email } = req.user.get();
  res.render('profile', { id, name, email });
});

app.get('/api', (req, res) => {

  const payload = {
    "animation_prompts": [
      {
        "frame": 0,
        "prompt": "Money tree"
      }
    ]
  };

  async function gooeyAPI() {
    // const response = await fetch("https://api.gooey.ai/v2/DeforumSD/?run_id=6gnu2gz9&uid=en5uGuoba4d7an6GL6bbQSmvLuk1", {
    //   method: "POST",
    //   headers: {
    //     "Authorization": "Bearer " + process.env["GOOEY_API_KEY"],
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(payload),
    // });

    const response = {
      "id": "1dm2e6tw", "url": "https://gooey.ai/animation-generator/?run_id=1dm2e6tw&uid=en5uGuoba4d7an6GL6bbQSmvLuk1",
      "created_at": "2023-11-28T05:37:17.569876",
      "output": {
        "output_video": "https://storage.googleapis.com/dara-c1b52.appspot.com/daras_ai/media/31f4b47e-8db0-11ee-ac6f-02420a0001b2/gooey.ai%20animation%20frame%200%20prompt%20Money%20tree.mp4"
      }
    }

    // if (!response.ok) {
    //   throw new Error(response.status);
    // }

    // const result = await response.json();
    // console.log(response.status, result);
    res.json(response);
  }
  gooeyAPI();
});

const PORT = process.env.PORT || 13000;
const server = app.listen(PORT, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${PORT} 🎧`);
});

module.exports = server;
