// Blog Application JavaScript
class BlogApp {
    constructor() {
        this.posts = [];
        this.filteredPosts = [];
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.currentCategory = 'all';
        this.currentSearch = '';
        this.likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || [];
        this.bookmarkedPosts = JSON.parse(localStorage.getItem('bookmarkedPosts')) || [];
        this.theme = localStorage.getItem('theme') || 'light';
        
        this.init();
    }

    async init() {
        this.applyTheme();
        this.setupEventListeners();
        await this.loadPosts();
        this.setupIntersectionObserver();
        this.checkNetworkStatus();
        this.createParticles();
        this.setupViewToggle();
    }

    // Theme Management
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeToggle = document.getElementById('theme-toggle');
        const icon = themeToggle.querySelector('i');
        
        if (this.theme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
        this.showToast('Theme changed successfully!');
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());

        // Mobile menu
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Smooth scroll for navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href');
                this.scrollToSection(target.substring(1));
                
                // Close mobile menu
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // Search functionality
        const searchInput = document.getElementById('search-input');
        const searchClear = document.getElementById('search-clear');
        
        searchInput.addEventListener('input', (e) => {
            this.currentSearch = e.target.value.toLowerCase();
            this.currentPage = 1;
            this.filterAndDisplayPosts();
            
            searchClear.style.display = this.currentSearch ? 'block' : 'none';
        });

        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            this.currentSearch = '';
            this.currentPage = 1;
            this.filterAndDisplayPosts();
            searchClear.style.display = 'none';
        });

        // Category filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentCategory = btn.dataset.category;
                this.currentPage = 1;
                this.filterAndDisplayPosts();
            });
        });

        // Load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        loadMoreBtn.addEventListener('click', () => this.loadMorePosts());

        // Newsletter form
        const newsletterForm = document.getElementById('newsletter-form');
        newsletterForm.addEventListener('submit', (e) => this.handleNewsletterSubmission(e));

        // Modal close
        const modalClose = document.getElementById('modal-close');
        const modal = document.getElementById('blog-modal');
        
        modalClose.addEventListener('click', () => this.closeModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });

        // Scroll events for navbar
        window.addEventListener('scroll', () => this.handleScroll());

        // Footer category links
        document.querySelectorAll('a[data-category]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = link.dataset.category;
                this.scrollToSection('blog-section');
                setTimeout(() => {
                    document.querySelectorAll('.filter-btn').forEach(btn => {
                        btn.classList.toggle('active', btn.dataset.category === category);
                    });
                    this.currentCategory = category;
                    this.currentPage = 1;
                    this.filterAndDisplayPosts();
                }, 500);
            });
        });
        
        // Category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.scrollToSection('blog-section');
                setTimeout(() => {
                    document.querySelectorAll('.filter-btn').forEach(btn => {
                        btn.classList.toggle('active', btn.dataset.category === category);
                    });
                    this.currentCategory = category;
                    this.currentPage = 1;
                    this.filterAndDisplayPosts();
                }, 500);
            });
        });
        
        // Contact form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmission(e));
        }
    }

    // Network Status Check
    checkNetworkStatus() {
        if (!navigator.onLine) {
            this.showToast('You are offline. Some features may not work properly.', 'warning');
        }

        window.addEventListener('online', () => {
            this.showToast('Connection restored!', 'success');
        });

        window.addEventListener('offline', () => {
            this.showToast('Connection lost. Working in offline mode.', 'warning');
        });
    }

    // Posts Loading and Management
    async loadPosts() {
        try {
            // In a real application, this would fetch from an API
            // For now, we'll use the mock data from blog-data.js
            if (typeof window.blogPosts !== 'undefined') {
                this.posts = window.blogPosts;
            } else {
                throw new Error('Blog data not available');
            }
            
            this.filterAndDisplayPosts();
            this.displayFeaturedPosts();
        } catch (error) {
            console.error('Error loading posts:', error);
            this.showErrorState('Failed to load blog posts. Please try again later.');
        }
    }

    filterAndDisplayPosts() {
        // Filter posts based on category and search
        this.filteredPosts = this.posts.filter(post => {
            const matchesCategory = this.currentCategory === 'all' || post.category.toLowerCase() === this.currentCategory;
            const matchesSearch = this.currentSearch === '' || 
                post.title.toLowerCase().includes(this.currentSearch) ||
                post.content.toLowerCase().includes(this.currentSearch) ||
                post.tags.some(tag => tag.toLowerCase().includes(this.currentSearch));
            
            return matchesCategory && matchesSearch;
        });

        this.displayPosts();
    }

    displayPosts() {
        const blogGrid = document.getElementById('blog-grid');
        const loadMoreBtn = document.getElementById('load-more-btn');
        const noResults = document.getElementById('no-results');

        if (this.filteredPosts.length === 0) {
            blogGrid.innerHTML = '';
            noResults.style.display = 'block';
            loadMoreBtn.style.display = 'none';
            return;
        }

        noResults.style.display = 'none';

        // Calculate posts to show
        const startIndex = 0;
        const endIndex = this.currentPage * this.postsPerPage;
        const postsToShow = this.filteredPosts.slice(startIndex, endIndex);

        // Clear existing posts if on first page
        if (this.currentPage === 1) {
            blogGrid.innerHTML = '';
        }

        // Add new posts
        postsToShow.slice((this.currentPage - 1) * this.postsPerPage).forEach((post, index) => {
            const postElement = this.createPostElement(post, index);
            blogGrid.appendChild(postElement);
        });

        // Show/hide load more button
        const hasMorePosts = endIndex < this.filteredPosts.length;
        loadMoreBtn.style.display = hasMorePosts ? 'flex' : 'none';

        // Update button state
        const btnText = loadMoreBtn.querySelector('.btn-text');
        btnText.textContent = hasMorePosts ? 'Load More Posts' : 'No More Posts';
    }

    displayFeaturedPosts() {
        const featuredContainer = document.getElementById('featured-posts');
        const featuredPosts = this.posts.filter(post => post.featured).slice(0, 3);

        if (featuredPosts.length === 0) {
            // If no featured posts, show latest posts
            featuredPosts.push(...this.posts.slice(0, 3));
        }

        featuredContainer.innerHTML = '';
        featuredPosts.forEach((post, index) => {
            const postElement = this.createPostElement(post, index, true);
            featuredContainer.appendChild(postElement);
        });
    }

    createPostElement(post, index, isFeatured = false) {
        const article = document.createElement('article');
        article.className = `blog-card ${isFeatured ? 'featured' : ''}`;
        article.style.animationDelay = `${index * 0.1}s`;
        article.setAttribute('role', 'article');
        article.setAttribute('tabindex', '0');

        const isLiked = this.likedPosts.includes(post.id);
        const isBookmarked = this.bookmarkedPosts.includes(post.id);

        article.innerHTML = `
            <div class="blog-card-image">
                <img src="${post.image}" alt="${post.title}" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg=='">
                <div class="blog-card-category">${this.capitalizeFirst(post.category)}</div>
            </div>
            <div class="blog-card-content">
                <h3 class="blog-card-title">${post.title}</h3>
                <p class="blog-card-excerpt">${post.excerpt}</p>
                <div class="blog-card-meta">
                    <div class="blog-card-author">
                        <img src="${post.author.avatar}" alt="${post.author.name}" class="author-avatar" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iI2Y1ZjVmNSIvPjxwYXRoIGQ9Im0yMCAyMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNGMwIDIuMjEgMS43OSA0IDQgNHM0LTEuNzkgNC00eiIgZmlsbD0iIzk5OSIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTAiIHI9IjQiIGZpbGw9IiM5OTkiLz48L3N2Zz4='" loading="lazy">
                        <span>${post.author.name}</span>
                    </div>
                    <span>${this.formatDate(post.publishedDate)}</span>
                    <span>${post.readTime} min read</span>
                </div>
                <div class="blog-card-tags">
                    ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
                <div class="blog-card-actions">
                    <div class="blog-card-actions-left">
                        <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}" aria-label="Like post">
                            <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                            <span>${post.likes || 0}</span>
                        </button>
                        <button class="action-btn bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" data-post-id="${post.id}" aria-label="Bookmark post">
                            <i class="${isBookmarked ? 'fas' : 'far'} fa-bookmark"></i>
                        </button>
                        <button class="action-btn share-btn" data-post-id="${post.id}" aria-label="Share post">
                            <i class="fas fa-share-alt"></i>
                        </button>
                    </div>
                    <button class="read-more-btn" data-post-id="${post.id}">
                        Read More <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        this.addPostEventListeners(article, post);

        return article;
    }

    addPostEventListeners(article, post) {
        // Like button
        const likeBtn = article.querySelector('.like-btn');
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleLike(post.id, likeBtn);
        });

        // Bookmark button
        const bookmarkBtn = article.querySelector('.bookmark-btn');
        bookmarkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleBookmark(post.id, bookmarkBtn);
        });

        // Share button
        const shareBtn = article.querySelector('.share-btn');
        shareBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.sharePost(post);
        });

        // Read more button
        const readMoreBtn = article.querySelector('.read-more-btn');
        readMoreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openPost(post);
        });

        // Card click
        article.addEventListener('click', () => this.openPost(post));

        // Keyboard navigation
        article.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.openPost(post);
            }
        });
    }

    // Interaction Methods
    toggleLike(postId, button) {
        const isLiked = this.likedPosts.includes(postId);
        const icon = button.querySelector('i');
        const count = button.querySelector('span');
        
        if (isLiked) {
            this.likedPosts = this.likedPosts.filter(id => id !== postId);
            button.classList.remove('liked');
            icon.className = 'far fa-heart';
            count.textContent = parseInt(count.textContent) - 1;
            this.showToast('Removed from likes');
        } else {
            this.likedPosts.push(postId);
            button.classList.add('liked');
            icon.className = 'fas fa-heart';
            count.textContent = parseInt(count.textContent) + 1;
            this.showToast('Added to likes!');
        }
        
        localStorage.setItem('likedPosts', JSON.stringify(this.likedPosts));
    }

    toggleBookmark(postId, button) {
        const isBookmarked = this.bookmarkedPosts.includes(postId);
        const icon = button.querySelector('i');
        
        if (isBookmarked) {
            this.bookmarkedPosts = this.bookmarkedPosts.filter(id => id !== postId);
            button.classList.remove('bookmarked');
            icon.className = 'far fa-bookmark';
            this.showToast('Removed from bookmarks');
        } else {
            this.bookmarkedPosts.push(postId);
            button.classList.add('bookmarked');
            icon.className = 'fas fa-bookmark';
            this.showToast('Added to bookmarks!');
        }
        
        localStorage.setItem('bookmarkedPosts', JSON.stringify(this.bookmarkedPosts));
    }

    async sharePost(post) {
        const shareData = {
            title: post.title,
            text: post.excerpt,
            url: window.location.href + '#post-' + post.id
        };

        try {
            if (navigator.share && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                this.showToast('Post shared successfully!');
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(shareData.url);
                this.showToast('Link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            this.showToast('Unable to share post', 'error');
        }
    }

    openPost(post) {
        const modal = document.getElementById('blog-modal');
        const modalBody = document.getElementById('modal-body');
        
        modalBody.innerHTML = `
            <article class="blog-post-full">
                <header class="post-header">
                    <div class="post-category">${this.capitalizeFirst(post.category)}</div>
                    <h1 class="post-title">${post.title}</h1>
                    <div class="post-meta">
                        <div class="post-author">
                            <img src="${post.author.avatar}" alt="${post.author.name}" class="author-avatar" loading="lazy">
                            <div class="author-info">
                                <span class="author-name">${post.author.name}</span>
                                <span class="author-role">${post.author.role || 'Writer'}</span>
                            </div>
                        </div>
                        <div class="post-date">
                            <i class="far fa-calendar"></i>
                            ${this.formatDate(post.publishedDate)}
                        </div>
                        <div class="post-read-time">
                            <i class="far fa-clock"></i>
                            ${post.readTime} min read
                        </div>
                    </div>
                </header>
                <div class="post-image">
                    <img src="${post.image}" alt="${post.title}" loading="lazy">
                </div>
                <div class="post-content">
                    ${this.formatPostContent(post.content)}
                </div>
                <footer class="post-footer">
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    </div>
                    <div class="post-actions">
                        <button class="action-btn like-btn ${this.likedPosts.includes(post.id) ? 'liked' : ''}" data-post-id="${post.id}">
                            <i class="${this.likedPosts.includes(post.id) ? 'fas' : 'far'} fa-heart"></i>
                            <span>Like</span>
                        </button>
                        <button class="action-btn bookmark-btn ${this.bookmarkedPosts.includes(post.id) ? 'bookmarked' : ''}" data-post-id="${post.id}">
                            <i class="${this.bookmarkedPosts.includes(post.id) ? 'fas' : 'far'} fa-bookmark"></i>
                            <span>Bookmark</span>
                        </button>
                        <button class="action-btn share-btn" data-post-id="${post.id}">
                            <i class="fas fa-share-alt"></i>
                            <span>Share</span>
                        </button>
                    </div>
                </footer>
            </article>
        `;

        // Add event listeners to modal actions
        modalBody.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', () => this.toggleLike(post.id, btn));
        });
        
        modalBody.querySelectorAll('.bookmark-btn').forEach(btn => {
            btn.addEventListener('click', () => this.toggleBookmark(post.id, btn));
        });
        
        modalBody.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', () => this.sharePost(post));
        });

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus management
        modalBody.focus();
    }

    closeModal() {
        const modal = document.getElementById('blog-modal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    loadMorePosts() {
        this.currentPage++;
        this.displayPosts();
    }

    // View Toggle Setup
    setupViewToggle() {
        const viewBtns = document.querySelectorAll('.view-btn');
        const blogGrid = document.getElementById('blog-grid');
        
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const view = btn.dataset.view;
                if (view === 'list') {
                    blogGrid.classList.add('list-view');
                } else {
                    blogGrid.classList.remove('list-view');
                }
            });
        });
    }
    
    // Create Particles for Hero Section
    createParticles() {
        const hero = document.querySelector('.hero');
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'hero-particles';
        
        // Create 50 particles
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
            particlesContainer.appendChild(particle);
        }
        
        const heroBackground = hero.querySelector('.hero-background');
        heroBackground.appendChild(particlesContainer);
    }
    
    // Contact Form Submission
    async handleContactSubmission(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const submitBtn = form.querySelector('.contact-btn');
        
        // Show loading state
        const originalText = submitBtn.querySelector('span').textContent;
        submitBtn.querySelector('span').textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            // Simulate API call
            await this.simulateApiCall(2000);
            
            form.reset();
            this.showToast('Message sent successfully! I\'ll get back to you soon.');
            
        } catch (error) {
            console.error('Contact form error:', error);
            this.showToast('Failed to send message. Please try again.', 'error');
        } finally {
            submitBtn.querySelector('span').textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Newsletter Submission
    async handleNewsletterSubmission(e) {
        e.preventDefault();
        
        const emailInput = document.getElementById('newsletter-email');
        const email = emailInput.value.trim();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        if (!this.isValidEmail(email)) {
            this.showToast('Please enter a valid email address', 'error');
            return;
        }

        // Show loading state
        const originalText = submitBtn.querySelector('.btn-text').textContent;
        submitBtn.querySelector('.btn-text').textContent = 'Subscribing...';
        submitBtn.disabled = true;

        try {
            // In a real application, this would make an API call
            await this.simulateApiCall(2000);
            
            emailInput.value = '';
            this.showToast('Successfully subscribed to newsletter!');
            
            // Store subscription in localStorage
            const subscriptions = JSON.parse(localStorage.getItem('newsletterSubscriptions')) || [];
            if (!subscriptions.includes(email)) {
                subscriptions.push(email);
                localStorage.setItem('newsletterSubscriptions', JSON.stringify(subscriptions));
            }
            
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            this.showToast('Subscription failed. Please try again.', 'error');
        } finally {
            submitBtn.querySelector('.btn-text').textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Utility Methods
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const offsetTop = section.offsetTop - (this.getNavbarHeight() + 20);
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    getNavbarHeight() {
        const navbar = document.getElementById('navbar');
        return navbar ? navbar.offsetHeight : 70;
    }

    handleScroll() {
        const navbar = document.getElementById('navbar');
        const scrollY = window.scrollY;
        
        // Add shadow to navbar when scrolled
        if (scrollY > 50) {
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }

        // Update active nav link based on scroll position
        this.updateActiveNavLink();
    }

    updateActiveNavLink() {
        const sections = ['home', 'blog-section', 'newsletter'];
        const scrollPosition = window.scrollY + this.getNavbarHeight() + 100;

        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            const navLink = document.querySelector(`a[href="#${sectionId}"]`);
            
            if (section && navLink) {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    document.querySelectorAll('.nav-link').forEach(link => {
                        link.classList.remove('active');
                    });
                    navLink.classList.add('active');
                }
            }
        });
    }

    setupIntersectionObserver() {
        // Lazy loading for images
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        });

        // Observe all images with data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });

        // Animation observer for blog cards
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.6s ease-out both';
                }
            });
        }, { threshold: 0.1 });

        // Observe all blog cards
        document.querySelectorAll('.blog-card').forEach(card => {
            animationObserver.observe(card);
        });
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = toast.querySelector('.toast-message');
        const toastIcon = toast.querySelector('i');
        
        // Set message and icon based on type
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        
        switch (type) {
            case 'success':
                toastIcon.className = 'fas fa-check-circle';
                break;
            case 'error':
                toastIcon.className = 'fas fa-exclamation-circle';
                break;
            case 'warning':
                toastIcon.className = 'fas fa-exclamation-triangle';
                break;
            default:
                toastIcon.className = 'fas fa-info-circle';
        }
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    showErrorState(message) {
        const blogGrid = document.getElementById('blog-grid');
        blogGrid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Oops! Something went wrong</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    Try Again
                </button>
            </div>
        `;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        if (days < 365) return `${Math.floor(days / 30)} months ago`;
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    formatPostContent(content) {
        // Convert line breaks to paragraphs and add some basic formatting
        return content
            .split('\n\n')
            .map(paragraph => `<p>${paragraph.trim()}</p>`)
            .join('');
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    simulateApiCall(delay) {
        return new Promise((resolve) => {
            setTimeout(resolve, delay);
        });
    }
}

// Global scroll function for CTA buttons
window.scrollToSection = function(sectionId) {
    const app = window.blogApp;
    if (app) {
        app.scrollToSection(sectionId);
    }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.blogApp = new BlogApp();
});

// Service Worker registration for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogApp;
}
