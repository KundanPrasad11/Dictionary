const searchInput = document.getElementById("search-input")
const searchButton = document.getElementById("search-button");
const searchedWord = document.getElementById("searched-word");
const loader = document.getElementById("loader");
const heading = document.getElementsByClassName("heading");
const info = document.getElementsByClassName("info-text");
const errorContainer = document.getElementById("error-container");
const audioContainer = document.getElementById("audio-container");
const themeToggle = document.getElementById("toggle-theme");
const themeText = document.getElementById("theme-text");

const lightTextColor = "#b5b5b5";
const darkTextColor = "#5b5b5b";
let speech = new SpeechSynthesisUtterance();

searchInput.addEventListener("input", clearPreviousData);
searchInput.addEventListener("keypress", function(e) {
  if(e.key === 'Enter') {
    handleSearch();
  }
});
searchButton.addEventListener("click", handleSearch);
audioContainer.addEventListener("click", handleSpeech);

async function handleSearch() {
  clearPreviousData();
  loader.style.display = "block"; // Show the loader
  const word = document.getElementById("search-input").value;
  const url = `https://wordsapiv1.p.rapidapi.com/words/${word}`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '0a87b9aa0cmshc1967b106a67582p148c17jsn4977f00e797c',
      'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    if (response.status == 200) {
      const result = await response.json();
      updateDefintions(result)
    } else if (response.status == 404) {
      let errorMessage = "Word does not exist in the dictionary!";
      handleError(errorMessage);
    } else if (response.status == 400) {
      let errorMessage = "Input cannot be empty!";
      handleError(errorMessage);
    }
  } catch (error) {
    let errorMessage = error.message || "An error occurred. Please try again later.";
    handleError(errorMessage);

  }
}

function handleError(message) {
  //Hide the loader
  loader.style.display = "none";
  errorContainer.style.display = "flex";
  const errorElement = document.getElementById("error-message");
  errorElement.textContent = message;
}

function clearPreviousData() {
  //Hiding the previous error container
  errorContainer.style.display = "none";

  //Removing word that was searched from view
  searchedWord.innerText = "";

  //Removing audio container
  audioContainer.style.display = "none";

  // Get #definitions to remove its child elements
  const definitionsContainer = document.getElementById("definitions");
  // Loop through and remove all child elements
  while (definitionsContainer.firstChild) {
    definitionsContainer.removeChild(definitionsContainer.firstChild);
  }
}

function updateDefintions(result) {
  //Hide the loader
  loader.style.display = "none";

  // display word and speaker below input box
  searchedWord.innerText = result.word;
  audioContainer.style.display = "block";

  const definitionsContainer = document.getElementById("definitions");

  //Sometimes we the response does not have results field inside result
  if(result && result.results) {
    //create and update containers for defintion, part of speech, examples
    result?.results.forEach((e, index) => {
      const definitionBox = document.createElement("div");
      definitionBox.classList.add("definition-box");
  
      const createAndAppendInfo = (topic, text) => {
        const info = document.createElement("p");
        const infoTopic = document.createElement("span");
        const infoAnswer = document.createElement("span");
        info.classList.add("info-text");
        infoTopic.classList.add("info-topic");
        infoAnswer.classList.add("info-answer");
        infoTopic.innerHTML = topic;
        infoAnswer.innerHTML = topic == "Example:"? findAndItalicizeWord(text, result.word) : text;
        if(localStorage.getItem("theme") == "dark") {
          info.style.color = lightTextColor;
        }
        info.appendChild(infoTopic);
        info.appendChild(infoAnswer);
        definitionBox.appendChild(info);
      };
      createAndAppendInfo(`Definition:` ,e.definition);
      createAndAppendInfo(`Part of speech:`, e.partOfSpeech);
      //Sometimes example is not there in response
      if (e.examples) {
        createAndAppendInfo(`Example:`, e.examples[0]);
      }
  
      definitionsContainer.appendChild(definitionBox);
    })
  } else {
    let errorMessage = `Oops we don't have any definition for "${result.word}"!`;
    handleError(errorMessage);
  }
}

function findAndItalicizeWord(sentence, word) {
  // Convert both the sentence and the word to lowercase for case-insensitive comparison
  const lowercasedSentence = sentence.toLowerCase();
  const lowercasedWord = word.toLowerCase();

  // Find the index of the word in the sentence
  const index = lowercasedSentence.indexOf(lowercasedWord);

  const italicizedSentence = `${sentence.substring(0, index)}<em>${sentence.substring(index, index + word.length)}</em>${sentence.substring(index + word.length)}`;
  
  // Display the italicized sentence
  return italicizedSentence;
}

function handleSpeech() {
  speech.text = searchedWord.innerText;
  window.speechSynthesis.speak(speech);
  // stop audio when the word is spoken
  speech.onend = function () {
    window.speechSynthesis.cancel();
  };
}


// Handling theme (light / dark)
function handleDarkTheme() {
  document.body.style.background = "#1E1E1E";
  heading[0].style.color = lightTextColor;
  themeText.style.color = lightTextColor;
  searchInput.style.background = lightTextColor;
  searchInput.style.color = "#1E1E1E";
  searchedWord.style.color = lightTextColor;
  for(let i=0; i<info.length; i++) {
    info[i].style.color = lightTextColor;
  }
  loader.style.color = lightTextColor;
}

function handleLightTheme() {
  document.body.style.background = "white";
  heading[0].style.color = darkTextColor;
  themeText.style.color = darkTextColor;
  searchInput.style.background = "white";
  searchInput.style.color = darkTextColor;
  searchedWord.style.color = darkTextColor;
  for(let i=0; i<info.length; i++) {
    info[i].style.color = darkTextColor;
  }
  loader.style.color = lightTextColor;
}

function toggleTheme() {
  if(themeToggle.checked) {
    handleDarkTheme();
    localStorage.setItem("theme", "dark");
  } else {
    handleLightTheme();
    localStorage.setItem("theme", "light");
  }
}

document.addEventListener("DOMContentLoaded", function() {
  if(localStorage.getItem("theme") == "dark") {
    themeToggle.checked = true;
    handleDarkTheme();
  }
  themeToggle.addEventListener("change", toggleTheme);
})