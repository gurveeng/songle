const express = require('express');
const app = express();
const port = 3000;
const querystring = require('querystring');
const crypto = require('crypto');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');

let accessToken = "";


app.use(cors());
// Add this middleware to set the CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // You can set specific origin instead of '*'
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(bodyParser.json());

const corsOptions = {
  origin: '*',
  methods: 'GET,POST',
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

class Track {
  constructor(title, artist, previewUrl) {
    this.title = title;
    this.artist = artist;
    this.previewUrl = previewUrl;
  }
}


// Function to generate a random string
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.randomBytes(length);
  return Array.from(values)
    .map((x) => possible[x % possible.length])
    .join('');
};

// Redirect URI and Spotify credentials
const redirectUri = 'https://songle.vercel.app/api/callback';
const clientId = '438a6377672b4b89995262d15d4d39ec';
const clientSecret = '6e8ee31f27fb429e80281903e235a8ad'; 



// Route for initiating the authentication flow
app.get('/api/login', (req, res) => {
  const state = generateRandomString(16);
  const scope = 'user-top-read user-read-recently-played streaming'; // Specify your desired scopes here
  console.log("reached endpoint");

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: clientId,
      scope: scope,
      redirect_uri: redirectUri,
      state: state
    }));
});

// Route for handling the callback from Spotify
app.get('/callback', async (req, res) => {
  const code = req.query.code || null;

  if (!code) {
    res.status(400).send('Authorization code not provided');
    return;
  }

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
      },
      body: querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    accessToken = tokenData.access_token;

    res.redirect('https://songle.vercel.app/main.html');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send(error.message);
  }
});

app.get('/sendTrackList', async (req,res) => {
  try {
    const toptracks = await fetchTopTracks(accessToken);

    // input toptracks title, artist, preview data into array of Tracks 
    let trackList = new Array(50).fill(null);

    const trackListLength = 50;

    let i = 0;
    while (i < trackListLength) {
      trackList[i] = new Track(toptracks.items[i].name, toptracks.items[i].artists[0].name, toptracks.items[i].preview_url);
      i = i + 1;
    }

    if (!trackList) {
      res.status(404).send('Track list not found');
      return;
    }

    // Send the track list as JSON
    res.json({ trackList });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
  }
});


// fetch top tracks data 
async function fetchTopTracks(token) {
  const result = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=50", {
      method: "GET", headers: { Authorization: `Bearer ${token}` }
  });

  return await result.json();
}



// fetch search results
async function fetchSearchResults(searchInput) {
  console.log(searchInput);
  const result = await fetch(`https://api.spotify.com/v1/search?q=${searchInput}&type=track&limit=3`, {
    method: "GET",
    headers: { 
      Authorization: `Bearer ${accessToken}`
    }
  });
  return await result.json();
}


// send search results
app.post('/sendSearchResults', async (req, res) => {
  try {
    const { searchInput } = req.body; // Destructure searchInput from req.body
    console.log(searchInput);
    const searchResults = await fetchSearchResults(searchInput);

    // Send the search results as JSON
    res.json({ searchResults });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
  }
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


