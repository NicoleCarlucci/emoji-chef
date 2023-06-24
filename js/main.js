// OPENAI configuration
const OPENAI = {
  API_BASE_URL: "https://api.openai.com/v1",
  CHAT_ENDPOINT: "/chat/completions",
  IMAGE_ENDPOINT: "/images/generations",
  API_KEY: "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"
};

// Store elements in variables
const ingredients = document.querySelectorAll(".ingredient");
const bowlSlots = document.querySelectorAll(".bowl-slot");
const cookButton = document.querySelector("#cook-button");
const loader = document.querySelector(".loading");
const modal = document.querySelector(".modal");
const recipeContent = document.querySelector(".recipe-content");
const recipeImage = document.querySelector(".recipe-image");
const modalClose = document.querySelector(".modal-close");
const loadingMessage = document.querySelector(".loading-message");

// Init bowl state
let bowl = [];

// Ingredient click event
ingredients.forEach(function (element) {
  element.addEventListener("click", function () {
    addIngredient(element.innerText);
  });
});

//Create modal close event
modalClose.addEventListener("click", function () {
  modal.classList.add("hidden");
});

// Create recipe event
cookButton.addEventListener("click", createRecipe);

// function definitions
function addIngredient(ingredient) {
  const maxSlots = bowlSlots.length;

  //before entering the ingredient
  if (bowl.length === maxSlots) {
    bowl.shift();
  }
  bowl.push(ingredient);

  bowlSlots.forEach(function (slot, index) {
    if (bowl[index]) {
      slot.innerText = bowl[index];
    }
  });

  //after entering the ingredient
  if (bowl.length === maxSlots) {
    cookButton.classList.remove("hidden");
  }
}

async function createRecipe() {
  loadingMessage.innerText = getRandomLoadingMessage();
  loader.classList.remove("hidden");

  const interval = setInterval(() => {
    loadingMessage.innerText = getRandomLoadingMessage();
  }, 2000);

  const prompt = `\
  Crea una ricetta con questi ingredienti: ${bowl.join(", ")}.
  La ricetta deve essere facile e con un titolo creativo e divertente.
  Le tue risposte sono solo in formato JSON come questo esempio:
  
  ###
  
  {
      "titolo": "Titolo ricetta",
      "ingredienti": "1 uovo e 1 pomodoro",
      "istruzioni": "mescola gli ingredienti e metti in forno"
  }
  
  ###`;

  const recipeResponse = await makeRequest(OPENAI.CHAT_ENDPOINT, {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const recipe = JSON.parse(recipeResponse.choices[0].message.content);

  loader.classList.add("hidden");
  modal.classList.remove("hidden");
  clearInterval(interval);

  recipeContent.innerHTML = `\
  <h2>${recipe.titolo}</h2>
  <p>${recipe.ingredienti}</p>
  <p>${recipe.istruzioni}</p>`;

  const imageResponse = await makeRequest(OPENAI.IMAGE_ENDPOINT, {
    prompt: recipe.titolo,
    n: 1,
    size: "512x512"
  });

  const imageUrl = imageResponse.data[0].url;
  recipeImage.innerHTML = `<img src= "${imageUrl}" alt= "recipe image" />`;

  clearBowl();
}

function getRandomLoadingMessage() {
  const messages = [
    "Preparo gli ingredienti...",
    "Scaldo i fornelli...",
    "Mescolo nella ciotola...",
    "Scatto foto per Instagram...",
    "Prendo il mestolo...",
    "Metto il grembiule...",
    "Mi lavo le mani...",
    "Tolgo le bucce...",
    "Pulisco il ripiano..."
  ];

  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

function clearBowl() {
  bowl = [];

  bowlSlots.forEach(function (slots) {
    slots.innerText = "?";
  });
}

async function makeRequest(endpoint, payload) {
  const response = await fetch(OPENAI.API_BASE_URL + endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI.API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  const json = await response.json();
  return json;
}
