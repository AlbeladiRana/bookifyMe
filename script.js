/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

// Get the main elements from the page
const keywordInput = document.getElementById("keyword");
const vibeSelect = document.getElementById("vibe");
const generateBtn = document.getElementById("generateBtn");
const surpriseBtn = document.getElementById("surpriseBtn");
const clearBtn = document.getElementById("clearBtn");
const resultsContainer = document.getElementById("resultsContainer");
const messageBox = document.getElementById("messageBox");

// Description for each vibe
const vibeDescriptions = {
  dreamy: "A soft, glowing story filled with wonder, emotion, and delicate magic.",
  bold: "A fearless story with sharp energy, ambition, and unforgettable decisions.",
  romantic: "A tender and emotional story where feelings shape every page.",
  dark: "A moody, shadowy story with secrets, tension, and mystery.",
  calm: "A gentle, thoughtful story with peaceful pacing and reflective beauty.",
  chaotic: "A wild, unpredictable story full of intensity and restless energy.",
  hopeful: "A warm and uplifting story that leaves light behind every chapter.",
  mysterious: "A layered story full of quiet suspense and hidden truths.",
  fantasy: "A magical story filled with imagination, adventure, and wonder.",
  poetry: "A lyrical and expressive story that feels delicate, artistic, and emotional.",
  adventure: "A thrilling story driven by courage, movement, and discovery.",
  horror: "A chilling story with eerie moments, suspense, and haunting atmosphere."
};

// Cover style text for each vibe
const coverStyles = {
  dreamy: "Soft pastel clouds and golden light",
  bold: "Strong typography with dramatic contrast",
  romantic: "Blush tones, elegant florals, and warm sunset light",
  dark: "Deep shadows, smoky textures, and cinematic tones",
  calm: "Minimal design with airy space and muted neutrals",
  chaotic: "Broken textures, vivid gradients, and intense motion",
  hopeful: "Light-filled artwork with sunrise tones",
  mysterious: "Fog, moonlight, and subtle antique details",
  fantasy: "Magical illustrations with glowing details",
  poetry: "Elegant artistic cover with soft textures",
  adventure: "Dynamic scenery with rich cinematic depth",
  horror: "Dark dramatic design with haunting contrast"
};

// Random words for surprise mode
const surpriseWords = [
  "moonlight",
  "fearless",
  "velvet",
  "midnight",
  "golden",
  "whisper",
  "echo",
  "starlit",
  "soft",
  "wildflower"
];

// Random vibes for surprise mode
const surpriseVibes = [
  "dreamy",
  "bold",
  "romantic",
  "dark",
  "calm",
  "chaotic",
  "hopeful",
  "mysterious",
  "fantasy",
  "poetry",
  "adventure",
  "horror"
];

// Add events to buttons and inputs
generateBtn.addEventListener("click", generateBookPersona);
clearBtn.addEventListener("click", clearResults);
surpriseBtn.addEventListener("click", useSurpriseMode);
keywordInput.addEventListener("keyup", handleKeyup);
vibeSelect.addEventListener("change", handleSelectionChange);

// Handle typing in the input field
function handleKeyup(event) {
  if (event.key === "Enter") {
    generateBookPersona();
    return;
  }

  const textLength = keywordInput.value.trim().length;
  if (textLength > 0) {
    showMessage("Nice. Keep going… your book vibe is forming.");
  } else {
    clearMessage();
  }
}

// Handle vibe selection
function handleSelectionChange() {
  const vibe = vibeSelect.value;

  if (vibe) {
    showMessage("Perfect choice. Now generate your book.");
  }
}

// Show a message to the user
function showMessage(text, isError = false) {
  messageBox.textContent = text;
  messageBox.style.color = isError ? "#b35f6b" : "#9a6a73";
}

// Clear the message
function clearMessage() {
  messageBox.textContent = "";
}

// Clear inputs and results
function clearResults() {
  resultsContainer.innerHTML = "";
  clearMessage();
  keywordInput.value = "";
  vibeSelect.value = "";
}

// Fill the form with random values
function useSurpriseMode() {
  keywordInput.value = randomItem(surpriseWords);
  vibeSelect.value = randomItem(surpriseVibes);
  showMessage("Surprise mode activated ✦");
  generateBookPersona();
}

// Return a random item from an array
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Main function to generate the book card
async function generateBookPersona() {
  const keyword = keywordInput.value.trim();
  const vibe = vibeSelect.value;

  if (!keyword) {
    showMessage("Please enter your name or a descriptive word first.", true);
    renderEmptyState("Missing input", "Add your name or a word like dreamy, fearless, soft, or wild.");
    return;
  }

  if (!vibe) {
    showMessage("Please choose your vibe first.", true);
    renderEmptyState("Almost there", "Choose a vibe so I can match the right book for you.");
    return;
  }

  showMessage("Searching for your book persona...");
  resultsContainer.innerHTML = `
    <div class="empty-state">
      <h3>Finding your book…</h3>
      <p>Please wait a moment while we search and build your result.</p>
    </div>
  `;

  try {
    const book = await fetchBook(keyword, vibe);
    const quote = await fetchQuote();
    renderBookCard(book, quote, keyword, vibe);

    setTimeout(() => {
      document.querySelector(".book-card")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 300);

    showMessage("Your personalized book card is ready ✦");
  } catch (error) {
    showMessage("Something went wrong while fetching data. Please try again.", true);
    renderEmptyState(
      "Could not generate your book",
      "The API request failed this time. Try another keyword or vibe."
    );
  }
}

// Fetch book data from Open Library API
async function fetchBook(keyword, vibe) {
  const query = `${keyword} ${vibe}`;
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Book request failed");
  }

  const data = await response.json();

  if (!data.docs || data.docs.length === 0) {
    throw new Error("No books found");
  }

  const bookWithCover =
    data.docs.find((book) => book.cover_i && book.title) ||
    data.docs.find((book) => book.title) ||
    data.docs[0];

  return {
    title: bookWithCover.title || "Untitled Book",
    author: bookWithCover.author_name ? bookWithCover.author_name[0] : "Unknown Author",
    publishYear: bookWithCover.first_publish_year || "Unknown",
    subjects: bookWithCover.subject ? bookWithCover.subject.slice(0, 3) : ["book", vibe],
    coverId: bookWithCover.cover_i || null
  };
}

// Fetch a random quote
async function fetchQuote() {
  const response = await fetch("https://dummyjson.com/quotes/random");
  if (!response.ok) {
    throw new Error("Quote request failed");
  }

  const data = await response.json();
  return {
    text: data.quote || "Every story begins with a single page.",
    author: data.author || "Unknown"
  };
}

// Build the custom description text
function buildDescription(keyword, vibe, title) {
  const cleanVibe = formatVibe(vibe);
  const vibeText = vibeDescriptions[vibe] || "A unique story with a memorable emotional presence.";

  return `"${title}" is the book version of ${capitalize(keyword)} — a ${cleanVibe.toLowerCase()} inspired story with a distinct personality. ${vibeText}`;
}

// Format vibe text for display
function formatVibe(vibe) {
  return vibe
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
}

// Make the first letter uppercase
function capitalize(word) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Get the correct cover image
function getCoverUrl(book, vibe) {
  if (book.coverId) {
    return `https://covers.openlibrary.org/b/id/${book.coverId}-L.jpg`;
  }

  const images = {
    dreamy: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
    bold: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    romantic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    dark: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    calm: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80",
    chaotic: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80",
    hopeful: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
    mysterious: "https://images.unsplash.com/photo-1511300636408-a63a89df3482?auto=format&fit=crop&w=800&q=80",
    fantasy: "https://images.unsplash.com/photo-1516534775068-ba3e7458af70?auto=format&fit=crop&w=800&q=80",
    poetry: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80",
    adventure: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
    horror: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=800&q=80"
  };

  return images[vibe];
}

// Create and display the book card
function renderBookCard(book, quote, keyword, vibe) {
  const description = buildDescription(keyword, vibe, book.title);
  const coverStyle = coverStyles[vibe] || "Elegant editorial cover design";
  const coverUrl = getCoverUrl(book, vibe);

  resultsContainer.innerHTML = `
    <article class="book-card">
      <div class="book-cover-wrap">
        <img class="book-cover" src="${coverUrl}" alt="Book cover for ${book.title}">
      </div>

      <div class="book-info">
        <div class="badge-row">
          <span class="badge">${formatVibe(vibe)}</span>
          <span class="badge">Book Persona</span>
        </div>

        <h2 class="book-title">${book.title}</h2>

        <div class="book-meta">
          <div class="meta-box">
            <span>Author</span>
            <strong>${book.author}</strong>
          </div>

          <div class="meta-box">
            <span>First Publish Year</span>
            <strong>${book.publishYear}</strong>
          </div>

          <div class="meta-box">
            <span>Cover Style</span>
            <strong>${coverStyle}</strong>
          </div>

          <div class="meta-box">
            <span>Book Vibe</span>
            <strong>${formatVibe(vibe)}</strong>
          </div>
        </div>

        <div class="description-box">
          <h3>Description</h3>
          <p>${description}</p>
        </div>

        <div class="description-box">
          <h3>Top Subjects</h3>
          <p>${book.subjects.join(" • ")}</p>
        </div>

        <div class="quote-box">
          <h3>Matching Quote</h3>
          <p>"${quote.text}"</p>
          <em>— ${quote.author}</em>
        </div>

        <div class="card-actions">
          <button class="small-btn primary" id="tryAnotherBtn">Try Another Vibe</button>
          <button class="small-btn secondary" id="removeCardBtn">Remove Card</button>
        </div>
      </div>
    </article>
  `;

  document.getElementById("tryAnotherBtn").addEventListener("click", useSurpriseMode);
  document.getElementById("removeCardBtn").addEventListener("click", removeCard);
}

// Remove the result card
function removeCard() {
  resultsContainer.innerHTML = "";
  showMessage("The result card was removed.");
}

// Show an empty state box
function renderEmptyState(title, text) {
  resultsContainer.innerHTML = `
    <div class="empty-state">
      <h3>${title}</h3>
      <p>${text}</p>
    </div>
  `;
}