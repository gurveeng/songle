
const audio = document.querySelector("#audioPlayer")
let duration = 2;

// game variables
let trackList = new Array(50).fill(null);
let score = 0;
let lost = false;
class searchResult {
  constructor(title, artist) {
    this.title = title;
    this.artist = artist;
  }
}

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements at indices i and j
  }
};

const getTrackList = async () => {
  try {
    // Make a fetch request to the server's /sendTrackList endpoint
    const response = await fetch('https://songle.vercel.app/sendTrackList');
    
    if (!response.ok) {
      throw new Error('Failed to fetch track list');
    }
    
    const responseData = await response.json(); 
    return responseData.trackList;
  } catch (error) {
    console.error('Error:', error);
    // Handle errors if any
  }
};

// Use async/await to get the result of the getTrackList function
const fetchTrackList = async () => {
  try {
    // Make a fetch request to the server's /sendTrackList endpoint
    const response = await fetch('https://songle.vercel.app/sendTrackList');
    
    if (!response.ok) {
      throw new Error('Failed to fetch track list');
    }
    
    const responseData = await response.json(); 
    trackList = responseData.trackList; // Assign the fetched trackList to the global variable
    return trackList;
  } catch (error) {
    console.error('Error:', error);
    // Handle errors if any
  }
};

// returns preview URL of what track should be playing for current level
const getCurrentTrack = () => {
  console.log(trackList[score].previewUrl);
  return trackList[score].previewUrl;
}

// sets audio source to current track for level
const setCurrentTrack = () => {
  audio.src = getCurrentTrack();
  console.log(audio.src);
}

// play audio for set duration
const playTrack = () => {
  // play
  audio.play();
  // stops music after set duration
  audio.ontimeupdate = function() {stop()};

// pauses and reloads music to stop
function stop() {
    if (audio.currentTime >= duration) {
      audio.pause();
      audio.load();
    };
}};



function startGame() {
  score = 0;

  const durationInput = prompt("Enter the duration (in seconds) for each track (1 - 6):");
  duration = parseInt(durationInput);
  
  if (isNaN(duration) || duration < 1 || duration > 6) {
    alert("Invalid input! Please enter a number between 1 and 6.");
    startGame(); // Restart the game if the input is invalid
    return;
  }

  const scoreElement = document.getElementById("score");
  scoreElement.textContent = "Score:" + score.toString();
  shuffleArray(trackList);
  setCurrentTrack();
}

fetchTrackList().then(() => {
  startGame();
});




const getSearchResults = async (searchInput) => {
  try {
    console.log(searchInput);
    const requestOptions = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ searchInput: searchInput }), // Wrap searchInput in an object
    };

    const response = await fetch('https://songle.vercel.app/sendSearchResults', requestOptions);
    
    if (!response.ok) {
      throw new Error('Failed to fetch search results');
    }
    
    const responseData = await response.json(); 
    let searchResults = new Array(3).fill(null);

    const listLength = 3;

    let i = 0;
    while (i < listLength) {
      searchResults[i] = new searchResult(responseData.searchResults.tracks.items[i].name, responseData.searchResults.tracks.items[i].artists[0].name);
      i = i + 1;
    }
    return (searchResults);
  } catch (error) {
    console.error('Error:', error);
    // Handle errors if any
  }
};

function showResults(val) {
  let res = document.getElementById("result");
  res.innerHTML = '';
  if (val == '') {
    return;
  }
  let list = '';
  getSearchResults(val).then(function(data) {
    for (let i = 0; i < data.length; i++) {
      // Escape special characters in title and artist
      let escapedTitle = data[i].title.replace(/'/g, "\\'").replace(/"/g, '\\"');
      let escapedArtist = data[i].artist.replace(/'/g, "\\'").replace(/"/g, '\\"');
      // Build the list item HTML
      list += '<li onclick="selectOption(\'' + escapedTitle + '\', \'' + escapedArtist + '\')">' + data[i].title + '<br>' + '-' + data[i].artist + '</li>';
    }
    res.innerHTML = '<ul>' + list + '</ul>';
    return true;
  }).catch(function(err) {
    console.warn('Something went wrong.', err);
    return false;
  });
}



function selectOption(title, artist) {
  console.log('Selected title:', title); // Log the title to see what's being received

  // Get the input field
  let inputField = document.getElementById("q");
  console.log('Input field:', inputField); // Log the input field to ensure it exists

  if (inputField) {
    // Insert the selected song title into the input field
    inputField.value = title + ' - ' + artist; // Added space after the hyphen for better readability
    console.log('Value set to input field:', inputField.value); // Log the value set to the input field
  } else {
    console.error('Input field not found'); // Log an error if the input field is not found
  }
}






function currentlyPlaying() {
  let currentTrack = trackList[score];
  console.log(currentTrack);
  return currentTrack;
}

function updateScore() {
  score++;
  console.log(score);

  const scoreElement = document.getElementById("score");

  // Update the text content of the <h2> element with the new score value
  scoreElement.textContent = "Score:" + score.toString();
}

function getHighScore() {
  return localStorage.getItem('highScore') || 0; // Return 0 if high score is not set
}

// Function to set the high score in local storage
function setHighScore(score) {
  localStorage.setItem('highScore', score);
}

function endGame() {
  const confirmation = confirm(`Game Over!\nYour Score: ${score}\n\nDo you want to retry?`);
  
  // If the player confirms retry, reload the page to restart the game
  if (confirmation) {
    startGame(); // Restart the game
  }
}

function submitAnswer() {
  // Get the input field
  let inputField = document.getElementById("q");
  
  // Extract the input value and trim any leading or trailing whitespace
  let inputValue = inputField.value.trim();

  // Split the input value into title and artist based on the hyphen
  let separatorIndex = inputValue.indexOf("-");
  if (separatorIndex !== -1) {
    let title = inputValue.substring(0, separatorIndex).trim();
    let artist = inputValue.substring(separatorIndex + 1).trim();

    let currentTrack = currentlyPlaying();
    console.log(currentTrack);

    currentTitle = currentTrack.title;
    currentArtist = currentTrack.artist;

    if (checkAnswer(title, artist, currentTitle, currentArtist)) {
      updateScore();
      // update level
      setCurrentTrack();
      // ADD POP UP THAT NEXT LEVEL
    }
    else {
      endGame();
      //end game
    }

    // Perform any actions with the extracted title and artist
    console.log("Title:", title);
    console.log("Artist:", artist);

    // Clear the input field after extracting the title and artist
    inputField.value = '';

    // Optionally, you can submit the extracted title and artist to a server or perform other actions here
  } else {
    // Handle case when no hyphen is found
    console.error("Invalid input format. Please enter title and artist separated by a hyphen.");
  }
}

// checks if correct answer 
const checkAnswer = (inputtedTitle, inputtedArtist, currentTitle, currentArtist) => {
  if (inputtedTitle != currentTitle || inputtedArtist != currentArtist) {
    return false;
  }
  return true;
}




const playButton = document.getElementById("playButton");
const enterButton = document.getElementById("enterButton");

if (playButton) {
  playButton.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default behavior of the button
    playTrack(); // Call the playTrack function
  });
}

if (enterButton) {
  enterButton.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default behavior of the button
    submitAnswer(); // Call the submitAnswer function
  });
}

