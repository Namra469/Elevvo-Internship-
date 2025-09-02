// DOM Elements
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const planModal = document.getElementById('plan-modal');
const thankYouModal = document.getElementById('thankyou-modal');
const modalClose = document.getElementById('modal-close');
const planForm = document.getElementById('plan-form');
const taskManager = document.getElementById('task-manager');
const newsletterForm = document.getElementById('newsletter-form');
const testimonialSlider = document.getElementById('testimonials-slider');

// Global Variables
let currentTestimonial = 0;
let tasks = JSON.parse(localStorage.getItem('taskflow-tasks')) || [];
let currentFilter = 'all';
let selectedPlan = '';

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeScrollAnimations();
    initializeNavigation();
    initializeTestimonials();
    initializePricing();
    initializeFAQ();
    initializeNewsletter();
    initializeTaskManager();
    updateTaskStats();
    renderTasks();
});

// Scroll Animations
function initializeScrollAnimations() {
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animateElements.forEach(el => observer.observe(el));
}

// Navigation
function initializeNavigation() {
    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Smooth scrolling for nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            scrollToSection(targetId.substring(1));
            
            // Close mobile menu
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(30, 41, 59, 0.98)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.background = 'rgba(30, 41, 59, 0.95)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        }
    });
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 70;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Testimonials Carousel
function initializeTestimonials() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prev-testimonial');
    const nextBtn = document.getElementById('next-testimonial');

    function showTestimonial(index) {
        // Hide all cards
        testimonialCards.forEach(card => {
            card.classList.remove('active');
        });

        // Remove active from all dots
        dots.forEach(dot => {
            dot.classList.remove('active');
        });

        // Show current card and dot
        testimonialCards[index].classList.add('active');
        dots[index].classList.add('active');
        
        currentTestimonial = index;
    }

    // Next testimonial
    function nextTestimonial() {
        const nextIndex = (currentTestimonial + 1) % testimonialCards.length;
        showTestimonial(nextIndex);
    }

    // Previous testimonial
    function prevTestimonial() {
        const prevIndex = (currentTestimonial - 1 + testimonialCards.length) % testimonialCards.length;
        showTestimonial(prevIndex);
    }

    // Event listeners
    nextBtn.addEventListener('click', nextTestimonial);
    prevBtn.addEventListener('click', prevTestimonial);

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showTestimonial(index));
    });

    // Auto-play testimonials
    setInterval(nextTestimonial, 5000);
}

// Pricing Section
function initializePricing() {
    const pricingCards = document.querySelectorAll('.pricing-card');

    pricingCards.forEach(card => {
        const btn = card.querySelector('.pricing-btn');
        btn.addEventListener('click', () => {
            selectedPlan = card.dataset.plan;
            showPlanModal(selectedPlan);
        });
    });

    // Modal close events
    modalClose.addEventListener('click', closePlanModal);
    planModal.addEventListener('click', (e) => {
        if (e.target === planModal) {
            closePlanModal();
        }
    });

    // Plan form submission
    planForm.addEventListener('submit', handlePlanSubmission);
}

// Show plan modal
function showPlanModal(plan) {
    const modalTitle = document.getElementById('modal-title');
    const selectedPlanInput = document.getElementById('selected-plan');
    
    modalTitle.textContent = `${capitalizeFirst(plan)} Plan Details`;
    selectedPlanInput.value = `${capitalizeFirst(plan)} Plan`;
    
    planModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close plan modal
function closePlanModal() {
    planModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    planForm.reset();
}

// Handle plan form submission
function handlePlanSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(planForm);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        company: formData.get('company'),
        plan: selectedPlan
    };

    // Simulate form processing
    setTimeout(() => {
        closePlanModal();
        
        if (selectedPlan === 'free') {
            // Show task manager for free plan
            taskManager.classList.remove('hidden');
            scrollToSection('task-manager');
        } else {
            // Show thank you modal for paid plans
            showThankYouModal(selectedPlan);
        }
    }, 1000);
}

// Show thank you modal
function showThankYouModal(plan) {
    const message = document.getElementById('thankyou-message');
    
    if (plan === 'pro') {
        message.textContent = 'Thank you for subscribing to our Pro plan. You\'ll receive a confirmation email shortly with next steps.';
    } else if (plan === 'team') {
        message.textContent = 'Thank you for your interest in our Team plan. Our sales team will contact you within 24 hours.';
    }
    
    thankYouModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close thank you modal
function closeThankYouModal() {
    thankYouModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// FAQ Section
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faqItem => {
                faqItem.classList.remove('active');
            });
            
            // Open clicked item if it wasn't already active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Newsletter
function initializeNewsletter() {
    newsletterForm.addEventListener('submit', handleNewsletterSubmission);
}

// Handle newsletter form submission
function handleNewsletterSubmission(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('newsletter-email');
    const feedback = document.getElementById('newsletter-feedback');
    const email = emailInput.value.trim();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        showNewsletterFeedback('Please enter a valid email address.', 'error');
        return;
    }
    
    // Simulate API call
    showNewsletterFeedback('Processing...', 'success');
    
    setTimeout(() => {
        showNewsletterFeedback('Thank you for subscribing! Check your email for confirmation.', 'success');
        emailInput.value = '';
        
        // Hide feedback after 5 seconds
        setTimeout(() => {
            feedback.classList.remove('show');
        }, 5000);
    }, 1500);
}

// Show newsletter feedback
function showNewsletterFeedback(message, type) {
    const feedback = document.getElementById('newsletter-feedback');
    feedback.textContent = message;
    feedback.className = `form-feedback ${type} show`;
}

// Task Manager
function initializeTaskManager() {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskPriority = document.getElementById('task-priority');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Add task
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Filter tasks
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
}

// Add new task
function addTask() {
    const taskInput = document.getElementById('task-input');
    const taskPriority = document.getElementById('task-priority');
    const text = taskInput.value.trim();
    
    if (!text) {
        taskInput.focus();
        return;
    }
    
    const task = {
        id: Date.now(),
        text: text,
        priority: taskPriority.value,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(task);
    saveTasks();
    updateTaskStats();
    renderTasks();
    
    // Reset form
    taskInput.value = '';
    taskInput.focus();
}

// Toggle task completion
function toggleTask(taskId) {
    const task = tasks.find(t => t.id === parseInt(taskId));
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        updateTaskStats();
        renderTasks();
    }
}

// Edit task
function editTask(taskId) {
    const task = tasks.find(t => t.id === parseInt(taskId));
    if (!task) return;
    
    const newText = prompt('Edit task:', task.text);
    if (newText !== null && newText.trim()) {
        task.text = newText.trim();
        saveTasks();
        renderTasks();
    }
}

// Delete task
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== parseInt(taskId));
        saveTasks();
        updateTaskStats();
        renderTasks();
    }
}

// Filter tasks based on current filter
function getFilteredTasks() {
    switch (currentFilter) {
        case 'completed':
            return tasks.filter(task => task.completed);
        case 'pending':
            return tasks.filter(task => !task.completed);
        case 'high':
            return tasks.filter(task => task.priority === 'high');
        case 'all':
        default:
            return tasks;
    }
}

// Render tasks
function renderTasks() {
    const tasksList = document.getElementById('tasks-list');
    const emptyState = document.getElementById('empty-state');
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        tasksList.style.display = 'none';
        emptyState.style.display = 'block';
        
        if (tasks.length === 0) {
            emptyState.querySelector('h3').textContent = 'No tasks yet';
            emptyState.querySelector('p').textContent = 'Add your first task to get started with TaskFlow!';
        } else {
            emptyState.querySelector('h3').textContent = 'No tasks found';
            emptyState.querySelector('p').textContent = 'Try changing your filter to see more tasks.';
        }
        return;
    }
    
    tasksList.style.display = 'flex';
    emptyState.style.display = 'none';
    
    tasksList.innerHTML = filteredTasks.map(task => `
        <div class="task-item-container ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''} 
                onchange="toggleTask(${task.id})"
            >
            <div class="task-content">
                <div class="task-text">${escapeHtml(task.text)}</div>
                <div class="task-priority ${task.priority}">${capitalizeFirst(task.priority)} Priority</div>
            </div>
            <div class="task-actions">
                <button class="task-btn edit-btn" onclick="editTask(${task.id})" title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-btn delete-btn" onclick="deleteTask(${task.id})" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Update task statistics
function updateTaskStats() {
    const totalTasks = document.getElementById('total-tasks');
    const completedTasks = document.getElementById('completed-tasks');
    const pendingTasks = document.getElementById('pending-tasks');
    
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    
    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('taskflow-tasks', JSON.stringify(tasks));
}

// Utility Functions
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export functions for global access
window.scrollToSection = scrollToSection;
window.closeThankYouModal = closeThankYouModal;
window.toggleTask = toggleTask;
window.editTask = editTask;
window.deleteTask = deleteTask;

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add scroll performance optimization
window.addEventListener('scroll', debounce(() => {
    // Any scroll-based functionality can be added here
}, 16)); // ~60fps

// Add keyboard shortcuts for better UX
document.addEventListener('keydown', (e) => {
    // Escape key closes modals
    if (e.key === 'Escape') {
        if (planModal.classList.contains('active')) {
            closePlanModal();
        }
        if (thankYouModal.classList.contains('active')) {
            closeThankYouModal();
        }
    }
    
    // Ctrl/Cmd + Enter adds task when input is focused
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const taskInput = document.getElementById('task-input');
        if (document.activeElement === taskInput && taskInput.value.trim()) {
            addTask();
        }
    }
});

// Add loading animation for better perceived performance
function showLoadingState(element) {
    const originalText = element.textContent;
    element.textContent = 'Loading...';
    element.disabled = true;
    
    return () => {
        element.textContent = originalText;
        element.disabled = false;
    };
}

// Initialize service worker for offline functionality (if needed)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker registration can be added here for PWA features
        console.log('TaskFlow loaded successfully!');
    });
}