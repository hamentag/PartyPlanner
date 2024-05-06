
const API_URL = 'https://fsa-crud-2aa9294fe819.herokuapp.com/api/2308-ACC-PT-WEB-PT-A/events';

// Initial state
const state = {
  parties: [],
};

// References
const partiesList = document.querySelector("#parties");
const popUpEl = document.querySelector(".popUp");
const partyIdEl = document.querySelector(".partyID");
const updPartyForm = document.querySelector("#updParty")
const overlay = document.getElementById('overlay');

//Add event listener so that a party is added when the form is submitted
const addPartyForm = document.querySelector("#addParty");
addPartyForm.addEventListener("submit", addParty);

// pop-Up and overlay will be hidden when closeButton is clicked
const closeButton = document.querySelector("#closeButton"); 
closeButton.addEventListener('click', () => {
  popUpEl.classList.remove('active')
  overlay.classList.remove('active')
});

/**
 * Sync state with the API and rerender 
 */
async function render() {
  await getParties();
  renderParties();
}

// Display the initial state
render();

/**
 * Update state with parties (events) from API
 */
async function getParties() {
  try {
    const response = await fetch(API_URL);
    const json = await response.json();
    state.parties = json.data;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Handle form submission for adding a party
 * @param {Event} event
 */
async function addParty(event) {
    event.preventDefault();
    try {
        console.log({ name : addPartyForm.title.value, 
          description : addPartyForm.description.value, 
          date: new Date(addPartyForm.date.value).toISOString(), 
          location: addPartyForm.location.value})
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name : addPartyForm.title.value, 
              description : addPartyForm.description.value, 
              date: new Date(addPartyForm.date.value).toISOString(), 
              location: addPartyForm.location.value}),
        });
        const json = await response.json();
        if (json.error) {
          throw new Error(json.message);
        }
        addPartyForm.reset();
        render();
      } catch (error) {
        console.error(error);
      }
}

// Add event listener so that party is updated when this form is submitted
updPartyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  try{
    // Updated party 
    updateParty(partyIdEl.value,
                updPartyForm.name.value,
                updPartyForm.description.value,
                new Date(updPartyForm.date.value).toISOString(),
                updPartyForm.location.value);

    // Refresh the list of parties   
    render();

    // Clear the input fields of updPartyForm
    updPartyForm.name.value = ''
    updPartyForm.description.value = ''
    updPartyForm.date.value = ''
    updPartyForm.location.value = ''

    // Hide the pop-up and overly 
    popUpEl.classList.remove('active')
    overlay.classList.remove('active')

  } catch (error) {
    console.error(error);
  }
})

/**
 * Ask API to update an existing party and rerender                
 * @param {number} id id of the party to update
 * @param {string} name new name of party
 * @param {string} description new description for party
 * @param {string} date new date-time of the party
 * @param {string} location new location of the party
 */
async function updateParty(id, name, description, date, location) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, date, location }),
    });
    const json = await response.json();

    if (json.error) {
      throw new Error(json.message);
    }

    render();
  } catch (error) {
    console.error(error);
  }
}

/**
 * Ask API to delete a party and rerender
 * @param {number} id id of party to delete
 */
async function deleteParty(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Party could not be deleted.");
    }

    render();
  } catch (error) {
    console.log(error);
  }
}

/**
 * Render parties from state
 */
function renderParties() {
  if (!state.parties.length) {
    partiesList.innerHTML = `<li>No parties found.</li>`;
    return;
  }
  const partyCards = state.parties.map((party) => {
    const partyCard = document.createElement("li");
    partyCard.classList.add("party");

    const partyTitle = document.createElement("h2");
    partyTitle.textContent=`${party.name}`

    const partyInfo = document.createElement("div");
    partyInfo.innerHTML = `
      <div class="party-info">
        <div>${party.description}</div>
        <div>${party.date}</div>
        <div>${party.location}</div>
      </div>
    `;

    // Add control butttons element
    const controlBtns = document.createElement("div");
    controlBtns.classList.add('control-btns');
  
    // Add the deleteButton feature
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete Party";
    deleteButton.addEventListener("click", () => deleteParty(party.id));

    // Add the editButton feature
    const editButton = document.createElement("button");
    editButton.textContent = "Edit Party";
        // Add event listener so that the partyIdEl value is updated and pop-Up and overlay 
        // are shown when this button is clicked
    editButton.addEventListener("click", () => {
      partyIdEl.value = (party.id);
      popUpEl.classList.add('active')
      overlay.classList.add('active')
    });

    controlBtns.append(editButton, deleteButton);

    const partyContent = document.createElement("div");
    partyContent.classList.add('party-content');

    partyContent.append(partyInfo, controlBtns);

    partyCard.append(partyTitle, partyContent);

    return partyCard;
  });
  partiesList.replaceChildren(...partyCards);
}
