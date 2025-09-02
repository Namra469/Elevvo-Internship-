// TechFlow Landing Page JavaScript
// Handles all interactive functionality, animations, and user interactions

class TechFlowApp {
    constructor() {
        this.currentTestimonial = 0;
        this.testimonialCount = 3;
        this.isYearlyBilling = false;
        this.init();
    }

    init() {
        // Initialize all components when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.initPreloader();
            this.initNavigation();
            this.initDarkMode();
            this.initAnimations();
            this.initTestimonialSlider();
            this.initPricingToggle();
            this.initForm();
            this.initScrollEffects();
            this.initLazyLoading();
        });
    }

    // Preloader functionality
    initPreloader() {
        const preloader = document.getElementById('preloader');
        
        // Hide preloader after 2 seconds or when page is fully loaded
        const hidePreloader = () => {
            if (preloader) {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500);
            }
        };

        // Hide preloader when everything is loaded
        if (document.readyState === 'complete') {
            setTimeout(hidePreloader, 1000);
        } else {
            window.addEventListener('load', () => {
                setTimeout(hidePreloader, 1000);
            });
        }
    }

    // Navigation functionality
    initNavigation() {
        const mobileMenuButton = document.getElementById('mobileMenuButton');
        const mobileMenu = document.getElementById('mobileMenu');
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
        const navbar = document.getElementById('navbar');

        // Mobile menu toggle
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                const isHidden = mobileMenu.classList.contains('hidden');
                
                if (isHidden) {
                    mobileMenu.classList.remove('hidden');
                    setTimeout(() => mobileMenu.classList.add('active'), 10);
                    mobileMenuButton.innerHTML = '<i class="fas fa-times"></i>';
                } else {
                    mobileMenu.classList.remove('active');
                    setTimeout(() => mobileMenu.classList.add('hidden'), 300);
                    mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        }

        // Smooth scrolling and active state for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open
                    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                        mobileMenu.classList.remove('active');
                        setTimeout(() => mobileMenu.classList.add('hidden'), 300);
                        mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                }
            });
        });

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('nav-scrolled');
            } else {
                navbar.classList.remove('nav-scrolled');
            }
        });

        // Update active navigation link on scroll
        this.updateActiveNavLink();
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        window.addEventListener('scroll', () => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                if (window.scrollY >= sectionTop) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('text-primary-600');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('text-primary-600');
                }
            });
        });
    }

    // Dark mode functionality
    initDarkMode() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        const darkModeToggleMobile = document.getElementById('darkModeToggleMobile');
        const html = document.documentElement;

        // Check for saved dark mode preference or default to light mode
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            html.classList.add('dark');
        }

        // Toggle dark mode
        const toggleDarkMode = () => {
            html.classList.toggle('dark');
            const isDark = html.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            // Animate the toggle
            const toggles = [darkModeToggle, darkModeToggleMobile];
            toggles.forEach(toggle => {
                if (toggle) {
                    toggle.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        toggle.style.transform = 'scale(1)';
                    }, 150);
                }
            });
        };

        // Add event listeners
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', toggleDarkMode);
        }
        if (darkModeToggleMobile) {
            darkModeToggleMobile.addEventListener('click', toggleDarkMode);
        }
    }

    // Initialize AOS animations
    initAnimations() {
        // Initialize AOS (Animate On Scroll)
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 1000,
                easing: 'ease-in-out',
                once: true,
                offset: 100
            });
        }

        // Add custom entrance animations
        const hero = document.querySelector('#home');
        if (hero) {
            setTimeout(() => {
                hero.classList.add('animate-fade-in');
            }, 500);
        }
    }

    // Testimonial slider functionality
    initTestimonialSlider() {
        const track = document.querySelector('.testimonial-track');
        const prevBtn = document.getElementById('prevTestimonial');
        const nextBtn = document.getElementById('nextTestimonial');
        const dots = document.querySelectorAll('.testimonial-dot');

        if (!track || !prevBtn || !nextBtn) return;

        const updateSlider = () => {
            const translateX = -this.currentTestimonial * 100;
            track.style.transform = `translateX(${translateX}%)`;

            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentTestimonial);
                if (index === this.currentTestimonial) {
                    dot.classList.remove('bg-gray-300', 'dark:bg-gray-600');
                    dot.classList.add('bg-primary-600');
                } else {
                    dot.classList.add('bg-gray-300', 'dark:bg-gray-600');
                    dot.classList.remove('bg-primary-600');
                }
            });
        };

        const nextSlide = () => {
            this.currentTestimonial = (this.currentTestimonial + 1) % this.testimonialCount;
            updateSlider();
        };

        const prevSlide = () => {
            this.currentTestimonial = (this.currentTestimonial - 1 + this.testimonialCount) % this.testimonialCount;
            updateSlider();
        };

        // Event listeners
        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);

        // Dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.currentTestimonial = index;
                updateSlider();
            });
        });

        // Auto-play functionality
        let autoplayInterval = setInterval(nextSlide, 5000);

        // Pause autoplay on hover
        const testimonialSection = document.querySelector('#testimonials');
        if (testimonialSection) {
            testimonialSection.addEventListener('mouseenter', () => {
                clearInterval(autoplayInterval);
            });

            testimonialSection.addEventListener('mouseleave', () => {
                autoplayInterval = setInterval(nextSlide, 5000);
            });
        }

        // Touch/swipe support for mobile
        this.initTouchSupport(track);

        // Initialize slider
        updateSlider();
    }

    initTouchSupport(element) {
        let startX = 0;
        let endX = 0;

        element.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        element.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const difference = startX - endX;

            if (Math.abs(difference) > 50) { // Minimum swipe distance
                if (difference > 0) {
                    // Swiped left - next slide
                    this.currentTestimonial = (this.currentTestimonial + 1) % this.testimonialCount;
                } else {
                    // Swiped right - previous slide
                    this.currentTestimonial = (this.currentTestimonial - 1 + this.testimonialCount) % this.testimonialCount;
                }
                
                const track = document.querySelector('.testimonial-track');
                const translateX = -this.currentTestimonial * 100;
                track.style.transform = `translateX(${translateX}%)`;
                
                // Update dots
                const dots = document.querySelectorAll('.testimonial-dot');
                dots.forEach((dot, index) => {
                    if (index === this.currentTestimonial) {
                        dot.classList.remove('bg-gray-300', 'dark:bg-gray-600');
                        dot.classList.add('bg-primary-600');
                    } else {
                        dot.classList.add('bg-gray-300', 'dark:bg-gray-600');
                        dot.classList.remove('bg-primary-600');
                    }
                });
            }
        });
    }

    // Pricing toggle functionality
    initPricingToggle() {
        const billingToggle = document.getElementById('billingToggle');
        const toggleButton = document.getElementById('toggleButton');
        const monthlyPrices = document.querySelectorAll('.monthly-price');
        const yearlyPrices = document.querySelectorAll('.yearly-price');

        if (!billingToggle || !toggleButton) return;

        billingToggle.addEventListener('click', () => {
            this.isYearlyBilling = !this.isYearlyBilling;
            
            // Update toggle appearance
            if (this.isYearlyBilling) {
                billingToggle.classList.add('bg-primary-600');
                billingToggle.classList.remove('bg-gray-300', 'dark:bg-gray-600');
                toggleButton.classList.add('translate-x-6');
                toggleButton.classList.remove('translate-x-1');
                billingToggle.setAttribute('aria-checked', 'true');
            } else {
                billingToggle.classList.remove('bg-primary-600');
                billingToggle.classList.add('bg-gray-300', 'dark:bg-gray-600');
                toggleButton.classList.remove('translate-x-6');
                toggleButton.classList.add('translate-x-1');
                billingToggle.setAttribute('aria-checked', 'false');
            }

            // Update pricing display with animation
            monthlyPrices.forEach(price => {
                price.style.opacity = this.isYearlyBilling ? '0' : '1';
                if (this.isYearlyBilling) {
                    setTimeout(() => price.classList.add('hidden'), 200);
                } else {
                    price.classList.remove('hidden');
                }
            });

            yearlyPrices.forEach(price => {
                price.style.opacity = this.isYearlyBilling ? '1' : '0';
                if (this.isYearlyBilling) {
                    price.classList.remove('hidden');
                } else {
                    setTimeout(() => price.classList.add('hidden'), 200);
                }
            });
        });
    }

    // Form handling and validation
    initForm() {
        const form = document.getElementById('newsletterForm');
        const emailInput = document.getElementById('emailInput');
        const emailError = document.getElementById('emailError');
        const formMessage = document.getElementById('formMessage');

        if (!form || !emailInput) return;

        // Real-time email validation
        emailInput.addEventListener('input', () => {
            const email = emailInput.value.trim();
            const isValid = this.validateEmail(email);
            
            if (email && !isValid) {
                emailError.textContent = 'Please enter a valid email address';
                emailError.classList.remove('hidden');
                emailInput.classList.add('border-red-500', 'focus:ring-red-500');
                emailInput.classList.remove('border-gray-300', 'dark:border-gray-600', 'focus:ring-primary-500');
            } else {
                emailError.classList.add('hidden');
                emailInput.classList.remove('border-red-500', 'focus:ring-red-500');
                emailInput.classList.add('border-gray-300', 'dark:border-gray-600', 'focus:ring-primary-500');
            }
        });

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            const submitButton = form.querySelector('button[type="submit"]');
            
            if (!this.validateEmail(email)) {
                this.showFormMessage('Please enter a valid email address', 'error');
                return;
            }

            // Show loading state
            const originalButtonText = submitButton.textContent;
            submitButton.innerHTML = '<span class="spinner"></span> Signing up...';
            submitButton.disabled = true;

            try {
                // Simulate API call (replace with actual endpoint)
                await this.simulateApiCall(email);
                
                this.showFormMessage('🎉 Success! Check your email to complete your signup.', 'success');
                form.reset();
            } catch (error) {
                this.showFormMessage('Something went wrong. Please try again.', 'error');
            } finally {
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            }
        });
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async simulateApiCall(email) {
        // Simulate network delay
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Newsletter signup: ${email}`);
                resolve();
            }, 1500);
        });
    }

    showFormMessage(message, type) {
        const formMessage = document.getElementById('formMessage');
        if (!formMessage) return;

        formMessage.textContent = message;
        formMessage.className = `mt-6 p-4 rounded-lg ${type === 'success' ? 'form-success' : 'form-error'}`;
        formMessage.classList.remove('hidden');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            formMessage.classList.add('hidden');
        }, 5000);
    }

    // Scroll effects and animations
    initScrollEffects() {
        // Parallax effect for hero section
        const hero = document.querySelector('#home');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            if (hero) {
                hero.style.transform = `translateY(${rate}px)`;
            }
        });

        // Animate elements on scroll
        this.initScrollAnimations();
    }

    initScrollAnimations() {
        const animateElements = document.querySelectorAll('.feature-card, .pricing-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'slideInUp 0.6s ease-out forwards';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animateElements.forEach(element => {
            observer.observe(element);
        });
    }

    // Lazy loading for performance
    initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Utility methods
    debounce(func, wait) {
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

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize the application
const techFlowApp = new TechFlowApp();

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    // Allow ESC to close mobile menu
    if (e.key === 'Escape') {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuButton = document.getElementById('mobileMenuButton');
        
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.remove('active');
            setTimeout(() => mobileMenu.classList.add('hidden'), 300);
            mobileMenuButton.innerHTML = '<i class="fas fa-bars"></i>';
        }
    }
});

// Add resize handler for responsive behavior
window.addEventListener('resize', techFlowApp.debounce(() => {
    // Recalculate slider positions on resize
    const track = document.querySelector('.testimonial-track');
    if (track) {
        const translateX = -techFlowApp.currentTestimonial * 100;
        track.style.transform = `translateX(${translateX}%)`;
    }
}, 250));

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
    });
}

// Service worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(registrationError => console.log('SW registration failed'));
    });
}
