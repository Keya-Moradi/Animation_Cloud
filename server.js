require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('./config/ppConfig');
const isLoggedIn = require('./middleware/isLoggedIn');
const { GeneratedVideos } = require('./models');
const { parse } = require('dotenv');
const generatedVideos = require('./models/generatedVideos');

// environment variables
SECRET_SESSION = process.env.SECRET_SESSION;

app.set('view engine', 'ejs');
app.use(require('express-ejs-layouts'));

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

app.get('/profile', isLoggedIn, async (req, res) => {
  const { id, name, email } = req.user.get();

  console.log(req.user.get())

  const dbVideos = await GeneratedVideos.findAll({
    where: {
      userId: id,
    },
  });

  const videoArray = dbVideos.map((dbVideo) => {
    return {
      videoName: dbVideo.dataValues.videoName,
      videoUrl: dbVideo.dataValues.videoUrl
    }
  })

  console.log(videoArray)

  res.render('profile', { id, name, email, videoArray });
});




app.get('/api', async (req, res) => {
  // TODO: should be const { userPrompt } = req.body;
  const { id, name, email } = req.user.get();
  const userPrompt = "White tiger in New York";

  const payload = {
    "animation_prompts": [
      {
        "frame": 10,
        "prompt": "White tiger in New York" // TODO: should be userPrompt
      }
    ]
  };
  async function gooeyAPI() {
    try {
     
      const response = await fetch("https://api.gooey.ai/v2/DeforumSD/?run_id=6gnu2gz9&uid=en5uGuoba4d7an6GL6bbQSmvLuk1", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + process.env.GOOEY_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(response.status);
      }
      const result = await response.json();
      // change 'result' to response for the actual app and comment out the 7 lines of code below for the actual app
      // const result = {
      //   "id": "1dm2e6tw",
      //   "url": "https://gooey.ai/animation-generator/?run_id=1dm2e6tw&uid=en5uGuoba4d7an6GL6bbQSmvLuk1",
      //   "created_at": "2023-11-28T05:37:17.569876",
      //   "output": {
      //     "output_video": "https://storage.googleapis.com/dara-c1b52.appspot.com/daras_ai/media/37383032-8e5f-11ee-b511-02420a000182/gooey.ai%20animation%20frame%2010%20prompt%20White%20tiger%20in%20New%20York.mp4#t=0.001"
      //   }
      // };
      let resultUrl = result.output.output_video;
      
      let generatedVideos = await GeneratedVideos.create({
        userId: id,
        videoUrl: resultUrl,
        videoName: userPrompt
      });
      console.log('Results Array before:', generatedVideos.dataValues.videoUrl);
      // if (generatedVideos.dataValues.videoUrl === null) {
      //   generatedVideos.dataValues.videoUrl = [resultUrl];
      // } else {
      //   generatedVideos.dataValues.videoUrl.push(resultUrl);
      // }
      console.log('Results Array after:', generatedVideos.dataValues.videoUrl);
      // generatedVideos.changed('videoUrl', true)
      await generatedVideos.save();
      res.render('result', { resultUrl });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  }
  gooeyAPI();
});

// app.get('/profile', isLoggedIn, (req, res) => {
//   res.render(resultUrl);
// });

app.put('/profile/edit', (req, res) => {
  res.render('edit.ejs')
})

const PORT = process.env.PORT || 13000;
const server = app.listen(PORT, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${PORT} 🎧`);
});

module.exports = server;