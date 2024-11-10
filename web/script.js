let articlesData = []; // Store all articles globally


// Initialize theme from localStorage or set default to light
const themeToggleButton = document.getElementById('theme-toggle');
const bodyElement = document.body;

// Initialize theme from localStorage or set default to light
const currentTheme = localStorage.getItem('theme') || 'light';
applyTheme(currentTheme);

function applyTheme(theme) {
    const footer = document.querySelector('.theme-footer');
    
    if (theme === 'dark') {
        bodyElement.classList.add('dark-theme');
        themeToggleButton.textContent = "Light Mode"; // Button text updates
    } else {
        bodyElement.classList.remove('dark-theme');
        themeToggleButton.textContent = "Dark Mode";
    }
    localStorage.setItem('theme', theme); // Save theme to local storage
}

// Event listener to toggle theme
themeToggleButton.addEventListener('click', () => {
    const newTheme = bodyElement.classList.contains('dark-theme') ? 'light' : 'dark';
    applyTheme(newTheme);
});




// Function to calculate reading time
function calculateReadingTime(wordCount) {
    const readingSpeed = 200; // Average reading speed in words per minute
    return Math.ceil(wordCount / readingSpeed); // Returns reading time in minutes
}

// Fetch Articles from JSON
fetch('articles.json')
    .then(response => response.json())
    .then(articles => {
        articlesData = articles;
        applySortingAndDisplay(); // Display articles with initial sorting
        setupCategoryFilter();
    })
    .catch(error => console.error('Error fetching articles:', error));

// Sorting Functionality
document.getElementById('sort-by').addEventListener('change', applySortingAndDisplay);

function applySortingAndDisplay() {
    const sortBy = document.getElementById('sort-by').value;
    const sortedArticles = [...articlesData].sort((a, b) => {
        return sortBy === 'date'
            ? new Date(b.date) - new Date(a.date)
            : b.views - a.views;
    });
    displayMostPopularArticle(sortedArticles);
    displayArticles(sortedArticles);
}

function displayMostPopularArticle(articles) {
    const mostPopularContainer = document.getElementById('most-popular-article');
    if (!articles.length) {
        mostPopularContainer.innerHTML = '<p>No articles available.</p>';
        return;
    }

    const mostPopularArticle = articles.reduce((prev, current) => (prev.views > current.views) ? prev : current);
    const readingTime = calculateReadingTime(mostPopularArticle.wordCount);

    mostPopularContainer.innerHTML = `
        <div class="card mb-3 most-popular-card" style="background-image: url('${mostPopularArticle.image}');">
            <div class="card-body">
                <h5 class="card-title">${mostPopularArticle.title}</h5>
                <p class="card-text text-muted">${mostPopularArticle.date} | <span class="views-count" data-article-id="${mostPopularArticle.id}">${mostPopularArticle.views}</span> views | ${readingTime} min read</p>
                <p class="card-text">${mostPopularArticle.content.substring(0, 100)}...</p>
                <button class="btn btn-primary btn-sm read-more-btn" data-article-id="${mostPopularArticle.id}">Read More</button>
            </div>
        </div>
    `;
}




// Display Articles in Sections (Featured, Top Stories, More Articles)
function displayArticles(articles) {
    const featuredContainer = document.getElementById('featured-article');
    const topStoriesContainer = document.getElementById('top-stories');
    const moreArticlesContainer = document.getElementById('right-sidebar-articles');
    const additionalFeaturedContainer = document.getElementById('additional-featured-articles');

    // Clear previous content
    featuredContainer.innerHTML = '';
    topStoriesContainer.innerHTML = '';
    moreArticlesContainer.innerHTML = '';
    additionalFeaturedContainer.innerHTML = '';

    if (!articles.length) {
        topStoriesContainer.innerHTML = '<p>No articles available for this category.</p>';
        return;
    }

    // Display Featured Article (first article)
    const [featuredArticle, ...remainingArticles] = articles;
    const featuredReadingTime = calculateReadingTime(featuredArticle.wordCount);

    featuredContainer.innerHTML = `
        <div class="card mb-3">
            <img src="${featuredArticle.image}" class="card-img-top" alt="${featuredArticle.title}">
            <div class="card-body">
                <h2 class="card-title">${featuredArticle.title}</h2>
                <p class="card-text text-muted">${featuredArticle.date} | <span class="views-count" data-article-id="${featuredArticle.id}">${featuredArticle.views}</span> views | ${featuredReadingTime} min read</p>
                <p class="card-text">${featuredArticle.content.substring(0, 100)}...</p>
                <button class="btn btn-primary btn-sm read-more-btn" data-article-id="${featuredArticle.id}">Read More</button>
            </div>
        </div>
    `;

    // Display remaining articles as Top Stories
    remainingArticles.forEach((article, index) => {
        const readingTime = calculateReadingTime(article.wordCount);
        const articleHTML = `
            <div class="card mb-3">
                <img src="${article.image}" class="card-img-top" alt="${article.title}">
                <div class="card-body">
                    <h5 class="card-title">${article.title}</h5>
                    <p class="card-text text-muted">${article.date} | <span class="views-count" data-article-id="${article.id}">${article.views}</span> views | ${readingTime} min read</p>
                    <p class="card-text">${article.content.substring(0, 50)}...</p>
                    <button class="btn btn-primary btn-sm read-more-btn" data-article-id="${article.id}">Read More</button>
                </div>
            </div>
        `;

        if (index < 3) {
            topStoriesContainer.innerHTML += articleHTML; // Add first 3 to Top Stories
        } else if (index < 6) {
            moreArticlesContainer.innerHTML += articleHTML; // Add next 3 to More Articles
        } else {
            additionalFeaturedContainer.innerHTML += articleHTML; // Add remaining to Additional Featured
        }
    });
}




// Function to show the modal with article content
function showAdditionalInfo(article) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContentBody = document.getElementById('modal-content-body');

    // Update modal content with the article's full text
    modalContentBody.innerHTML = `
        <h5>${article.title}</h5>
        <p>${article.date} | <span>${article.views}</span> views | ${calculateReadingTime(article.wordCount)} min read</p>
        <p>${article.content}</p> <!-- Display full article content here -->
    `;

    // Show the modal
    modalOverlay.style.display = 'flex';

    // Increment the view count
    article.views += 1;
    document.querySelectorAll(`.views-count[data-article-id="${article.id}"]`).forEach(element => {
        element.textContent = article.views;
    });
}

// Event listener to close the modal when the close button is clicked
document.getElementById('modal-close-btn').addEventListener('click', () => {
    document.getElementById('modal-overlay').style.display = 'none';
});

// Show additional info in modal and increase views each click
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('read-more-btn')) {
        const articleId = parseInt(event.target.getAttribute('data-article-id'));
        const article = articlesData.find(a => a.id === articleId);
        
        if (article) {
            showAdditionalInfo(article); // Show the modal with article content
        }
    }
});


// Set up Category Filter
function setupCategoryFilter() {
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const selectedCategory = event.target.getAttribute('data-category');

            // If the selected category is "World", display all articles
            const filteredArticles = selectedCategory === "World"
                ? articlesData
                : articlesData.filter(article => article.category === selectedCategory);

            // Update Most Popular and other article sections based on selected category
            displayMostPopularArticle(filteredArticles);
            displayArticles(filteredArticles);
        });
    });
}


