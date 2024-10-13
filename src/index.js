const BASE_URL = "http://localhost:3000/films";

const movieDetails = document.getElementById("movie-details");
const filmsList = document.getElementById("films");

document.addEventListener("DOMContentLoaded", async () => {
  const movies = await fetchMovies();
  if (movies.length > 0) {
    renderMovieList(movies);
    displayMovieDetails(movies[0]);
  }
});

async function fetchMovies() {
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error("Failed to fetch movies.");
    return await response.json();
  } catch (error) {
    console.error("Error fetching movies:", error);
    return [];
  }
}

function renderMovieList(movies) {
  filmsList.innerHTML = "";

  movies.forEach((movie) => {
    const li = document.createElement("li");
    li.className = "film item";

    const title = document.createElement("span");
    title.textContent = movie.title;
    li.appendChild(title);

    li.addEventListener("click", () => displayMovieDetails(movie));

    filmsList.appendChild(li);
  });
}

function displayMovieDetails(movie) {
  const availableTickets = movie.capacity - movie.tickets_sold;
  movieDetails.innerHTML = `
    <h2>${movie.title}</h2>
    <img src="${movie.poster}" alt="${movie.title}">
    <p>${movie.description}</p>
    <p><strong>Showtime:</strong> ${movie.showtime}</p>
    <p><strong>Runtime:</strong> ${movie.runtime} minutes</p>
    <p id="available-tickets"><strong>Available Tickets:</strong> ${availableTickets}</p>
    <button id="buy-ticket">${availableTickets > 0 ? "Buy Ticket" : "Sold Out"}</button>
  `;
  setupBuyButton(movie, availableTickets);
}

function setupBuyButton(movie, availableTickets) {
  const buyButton = document.getElementById("buy-ticket");

  buyButton.onclick = async () => {
    if (availableTickets > 0) {
      movie.tickets_sold++;
      displayMovieDetails(movie);

      try {
        await updateTicketsOnServer(movie);
      } catch (error) {
        console.error("Error updating tickets:", error);
        movie.tickets_sold--;
        displayMovieDetails(movie);
      }
    }
  };

  if (availableTickets <= 0) {
    buyButton.disabled = true;
    buyButton.textContent = "Sold Out";
  }
}

async function updateTicketsOnServer(movie) {
  try {
    await fetch(`${BASE_URL}/${movie.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tickets_sold: movie.tickets_sold }),
    });
  } catch (error) {
    throw new Error("Failed to update tickets on the server.");
  }
}


