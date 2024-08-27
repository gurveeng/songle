
const audio = document.querySelector("#audioPlayer")
let duration = 2;

// game variables
let trackList = new Array(10).fill(null);
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
    [array[i], array[j]] = [array[j], array[i]]; 
  }
};

const getTrackList = async () => {
  try {

    const response = await fetch('/api/sendTrackList');
    
    if (!response.ok) {
      throw new Error('Failed to fetch track list');
    }
    
    const responseData = await response.json(); 
    return responseData.trackList;
  } catch (error) {
    console.error('Error:', error);

  }
};


const fetchTrackList = async () => {
  try {

    const response = await fetch('/api/sendTrackList');
    
    if (!response.ok) {
      throw new Error('Failed to fetch track list');
    }
    
    const responseData = await response.json(); 
    trackList = responseData.trackList; 
  } catch (error) {
    console.error('Error:', error);

  }
};


const getCurrentTrack = () => {
  console.log(trackList[score].previewUrl);
  return trackList[score].previewUrl;
}

const setCurrentTrack = () => {
  audio.src = getCurrentTrack();
  console.log(audio.src);
}


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
    startGame(); // restart the game if the input is invalid
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
      body: JSON.stringify({ searchInput: searchInput }), 
    };

    const response = await fetch('/api/sendSearchResults', requestOptions);
    
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
      
      let escapedTitle = data[i].title.replace(/'/g, "\\'").replace(/"/g, '\\"');
      let escapedArtist = data[i].artist.replace(/'/g, "\\'").replace(/"/g, '\\"');
    
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
  console.log('Selected title:', title); 


  let inputField = document.getElementById("q");
  console.log('Input field:', inputField); 

  if (inputField) {
    
    inputField.value = title + ' - ' + artist; 
    console.log('Value set to input field:', inputField.value); 
  } else {
    console.error('Input field not found'); 
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


  scoreElement.textContent = "Score:" + score.toString();
}

function getHighScore() {
  return localStorage.getItem('highScore') || 0; 
}


function setHighScore(score) {
  localStorage.setItem('highScore', score);
}

function endGame() {
  const confirmation = confirm(`Game Over!\nYour Score: ${score}\n\nDo you want to retry?`);
  
  
  if (confirmation) {
    startGame(); 
  }
}

function submitAnswer() {
  
  let inputField = document.getElementById("q");
  
  
  let inputValue = inputField.value.trim();

  
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
      
      setCurrentTrack();
      
    }
    else {
      endGame();
    }

 
    console.log("Title:", title);
    console.log("Artist:", artist);


    inputField.value = '';

    
  } else {
    
    console.error("Invalid input format. Please enter title and artist separated by a hyphen.");
  }
}

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
    event.preventDefault(); 
    playTrack(); 
  });
}

if (enterButton) {
  enterButton.addEventListener('click', function(event) {
    event.preventDefault(); 
    submitAnswer(); 
  });
}

