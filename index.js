
const COHORT = "2308-ACC-PT-WEB-PT-A";
const API_URL = `https://fsa-crud-2aa9294fe819.herokuapp.com/api/${COHORT}/events`;

const state = {
  parties: [],
};

const partiesList = document.querySelector("#parties");

const addPartyForm = document.querySelector("#addParty");
addPartyForm.addEventListener("submit", addParty);

/**
 * Sync state with the API and rerender 
 */
async function render() {
  await getParties();
  renderParties();
}
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
    partyCard.innerHTML = `
      <h2>${party.name}</h2>
      <p>${party.description}</p>
      <p>${party.date}</p>
      <p>${party.location}</p>
    `;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete Party";
    partyCard.append(deleteButton);

    // Explain how closure allows us to access the correct party id
    deleteButton.addEventListener("click", () => deleteParty(party.id));

    return partyCard;
  });
  partiesList.replaceChildren(...partyCards);
}
