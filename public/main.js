const playButton = document.querySelector("#playButton");
const audio = document.querySelector("#audioPlayer")
const duration = 2;
audio.src = "https://p.scdn.co/mp3-preview/ae098651c7bf96d63160cb95cd8192bc561774b1?cid=438a6377672b4b89995262d15d4d39ec";

// game variables
let score = 0;
class searchResult {
  constructor(title, artist) {
    this.title = title;
    this.artist = artist;
  }
}

const getTrackList = async () => {
  try {
    // Make a fetch request to the server's /sendTrackList endpoint
    const response = await fetch('http://localhost:3000/sendTrackList');
    
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

    const response = await fetch('http://localhost:3000/sendSearchResults', requestOptions);
    
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
          list += '<li onclick="selectOption(\'' + data[i].title + '\', \'' + data[i].artist + '\')">' + data[i].title + '<br>' + '-' + data[i].artist + '</li>';
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




// shuffles order of track list
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements at indices i and j
  }
};

// returns preview URL of what track should be playing for current level
const getCurrentTrack = () => {
  return trackList[score][3];
}

// sets audio source to current track for level
const setCurrentTrack = () => {
  audio.src = getCurrentTrack();
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



// checks if correct answer -- INCOMPLETE
const checkAnswer = (inputtedAnswer) => {

}


// Event Listeners
if (playButton) {
  playButton.addEventListener('click', playTrack);
}