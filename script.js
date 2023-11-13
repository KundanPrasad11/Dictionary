const searchInput = document.getElementById("search-input")
const searchButton = document.getElementById("search-button");
const searchedWord = document.getElementById("searched-word");
const loader = document.getElementById("loader");
const audioContainer = document.getElementById("audio-container");
let speech = new SpeechSynthesisUtterance();

searchInput.addEventListener("input", clearPreviousData);
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
  const errorContainer = document.getElementById("error-container");
  errorContainer.style.display = "flex";
  const errorElement = document.getElementById("error-message");
  errorElement.textContent = message;
}

function clearPreviousData() {
  //Hiding the previous error container
  const errorContainer = document.getElementById("error-container");
  errorContainer.style.display = "none";

  //Removing word that was searched from view
  const searchedWord = document.getElementById("searched-word");
  searchedWord.innerText = "";

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

  //create and update containers for defintion, part of speech, examples
  result?.results.forEach((e, index) => {
    const definitionBox = document.createElement("div");
    definitionBox.classList.add("definition-box");

    const createAndAppendInfo = (text, className) => {
      const info = document.createElement("p");
      info.classList.add("info-text");
      info.innerText = text;
      definitionBox.appendChild(info);
    };

    createAndAppendInfo(`Definition: ${e.definition}`);
    createAndAppendInfo(`Part of speech: ${e.partOfSpeech}`);
    //Sometimes example is not there in response
    if (e.examples) {
      createAndAppendInfo(`Example: ${e.examples[0]}`);
    }

    definitionsContainer.appendChild(definitionBox);
  })
}

function handleSpeech() {
  speech.text = searchedWord.innerText;
  window.speechSynthesis.speak(speech);
  // stop audio when the word is spoken
  speech.onend = function () {
    window.speechSynthesis.cancel();
  };
}