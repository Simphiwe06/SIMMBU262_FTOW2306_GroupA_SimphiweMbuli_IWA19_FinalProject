// Import necessary modules and data from external files
import { BOOKS_PER_PAGE, genres, books, authors } from "./data.js";
import * as Module from "./elements.js";

// Initialize matches with all books
const matches = books;

// Initialize the current page to 1
let page = 1;

/**
 * Creates a preview button element for a book.
 *
 * @param {Object} book - The book data object.
 * @returns {HTMLButtonElement} - The created preview button element.
 */
function createPreview({ author, id, image, title }) {
    let element = document.createElement('button');
    element.classList = 'preview';
    element.setAttribute('data-preview', id);
    element.innerHTML = /* html */ `
        <img class='preview__image' src="${image}" />
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;
    return element;
}

// Create a fragment for the first 36 books to appear on the screen
const fragment1 = document.createDocumentFragment();
const extracted = books.slice(0, 36);
for (const { author, title, image, id } of extracted) {
    const preview = createPreview({ author, id, image, title });
    fragment1.appendChild(preview);
}
Module.dataListItem.appendChild(fragment1);

// Initialize the number of books to show
let showMore = page * BOOKS_PER_PAGE;

// Show more books button event listener
Module.dataListBtn.addEventListener('click', () => {
    const remaining = matches.slice(showMore, matches.length);
    const fragment = document.createDocumentFragment();
    for (const { author, title, image, id } of remaining) {
        const preview = createPreview({ author, id, image, title });
        fragment.appendChild(preview);
    }
    Module.dataListItem.appendChild(fragment);
    showMore += remaining.length;
    Module.dataListBtn.disabled = !(matches.length - showMore > 0);
});

// Display the remaining books count in the show more button
Module.dataListBtn.innerHTML = /* html */ `
    <span>Show More (
    <span class='list__remaining'>${matches.length - showMore > 0 ? matches.length - showMore : 0}</span>)
    </span>
`;

// Handle preview click
Module.dataListItem.addEventListener('click', (event) => {
    const pathArray = Array.from(event.path || event.composedPath());
    let active;
    for (const node of pathArray) {
        if (active) break;
        const previewId = node.dataset?.preview;
        for (const singleBook of books) {
            if (singleBook.id === previewId) {
                active = singleBook;
                break;
            }
        }
    }
    if (!active) {
        return;
    }
    Module.listActive.open = true;
    Module.listImg.setAttribute('src', active.image);
    Module.listBlur.style.backgroundImage = `url('${active.image}')`;
    Module.listTitle.textContent = active.title;
    Module.listSubtitle.textContent = `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
    Module.listDescription.textContent = active.description;
});

// List Close button event listener
Module.listCloseBtn.addEventListener('click', () => {
    Module.listActive.open = false;
});

// Search modal show button event listener
Module.searchHeaderBtn.addEventListener('click', () => {
    Module.searchOverlay.open = true;
});

// Search specific book form submission event listener
Module.searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // Hide the book list
    Module.dataListItem.style.display = 'none';
    // Clear the message area
    Module.listMessage.innerHTML = '';
    // Get form data
    const formData = new FormData(event.target);
    const title1 = formData.get('title');
    const genre1 = formData.get('genre');
    const author1 = formData.get('author');
    // Array to store filtered books
    const filteredBooks = [];
    // Loop through all books
    for (let i = 0; i < books.length; i++) {
        const book = books[i];
        // Filter by title only if genre and author are not selected
        if (genre1 === 'any' && author1 === 'any') {
            if (book.title.toLowerCase().includes(title1.toLowerCase())) {
                filteredBooks.push(book);
            }
        }
        // Filter by author and title if genre is not selected
        if (genre1 === 'any') {
            if (book.title.toLowerCase().includes(title1.toLowerCase()) && book.author === author1) {
                filteredBooks.push(book);
            }
        }
        // Filter by author and genre if title is not entered
        if (title1 === '') {
            if (book.author === author1 && book.genres.includes(genre1)) {
                filteredBooks.push(book);
            }
        }
        // Filter by genre only if neither title nor author are selected
        if (title1 === '' && author1 === 'any') {
            if (book.genres.includes(genre1)) {
                filteredBooks.push(book);
            }
        }
        // Display a message if no books match the filters
        if (filteredBooks.length > 0) {
            Module.listMessage.textContent = '';
            Module.dataListBtn.disabled = true;
        } else {
            Module.listMessage.textContent = 'No results found. Your filters might be too narrow.';
            Module.dataListBtn.disabled = true;
        }
    }
    // Display filtered books
    Module.listMessage.style.display = 'block';
    // Create a fragment to hold filtered books
    const fragment2 = document.createDocumentFragment();
    for (const { author, image, title, id, description, published } of filteredBooks) {
        const preview = document.createElement('button');
        preview.className = 'preview';
        preview.dataset.id = id;
        preview.dataset.title = title;
        preview.dataset.image = image;
        preview.dataset.subtitle = `${authors[author]} (${new Date(published).getFullYear()})`;
        preview.dataset.description = description;
        preview.dataset.genre = genres;
        // Create preview button with book information
        preview.innerHTML = /*html */
            `
            <div>
                <img class='preview__image' src="${image}" />
            </div>
            <div class="preview__info">
                <dt class="preview__title">${title}</dt>
                <div class="preview__author">${authors[author]}</div>
            </div>
            `;
        // Append preview button to fragment
        fragment2.appendChild(preview);
    }
    // Add filtered books to the message area
    const booklist2 = Module.listMessage;
    booklist2.appendChild(fragment2);
    Module.searchForm.reset();
    Module.searchOverlay.close();
});

// Create a dropdown for genres
const allGenresOption = document.createElement('option');
allGenresOption.value = 'any';
allGenresOption.innerText = 'All Genres';
Module.searchGenre.appendChild(allGenresOption);
for (const [id, names] of Object.entries(genres)) {
    const element = document.createElement('option');
    element.value = id;
    element.innerText = names;
    Module.searchGenre.appendChild(element);
}

// Create a dropdown for Authors
const allAuthorsOption = document.createElement('option');
allAuthorsOption.value = 'any';
allAuthorsOption.innerText = 'All Authors';
Module.searchAuthor.appendChild(allAuthorsOption);
for (const [id, names] of Object.entries(authors)) {
    const element = document.createElement('option');
    element.value = id;
    element.innerText = names;
    Module.searchAuthor.appendChild(element);
}

// Close the preview overlay
Module.listCloseBtn.addEventListener('click', () => {
    Module.listActive.open = false;
});

// Theme mode
// Get the settings button and add a click event listener
Module.settingHeaderBtn.addEventListener('click', (event) => {
    event.preventDefault();
    // Show the theme overlay dialog
    Module.settingOverlay.show();
});

// Defines the color values for the day and night themes
const css = {
    day: {
        dark: '10, 10, 20',
        light: '255, 255, 255',
    },
    night: {
        dark: '255, 255, 255',
        light: '10, 10, 20',
    },
};

// Theme setting form submission event listener
Module.settingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const theme = Module.settingTheme.value;
    document.documentElement.style.setProperty('--color-dark', css[theme].dark);
    document.documentElement.style.setProperty('--color-light', css[theme].light);
    Module.settingOverlay.close();
});
