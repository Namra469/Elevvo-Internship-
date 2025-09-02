// Contact Form Validation and Interaction Handler
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.fields = {
            fullName: document.getElementById('fullName'),
            email: document.getElementById('email'),
            subject: document.getElementById('subject'),
            message: document.getElementById('message')
        };
        this.errorElements = {
            fullName: document.getElementById('fullNameError'),
            email: document.getElementById('emailError'),
            subject: document.getElementById('subjectError'),
            message: document.getElementById('messageError')
        };
        this.submitBtn = document.getElementById('submitBtn');
        this.successMessage = document.getElementById('successMessage');
        this.charCount = document.getElementById('charCount');
        
        this.init();
    }

    init() {
        // Add event listeners
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Add input event listeners for real-time validation
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            field.addEventListener('input', () => this.validateField(fieldName));
            field.addEventListener('blur', () => this.validateField(fieldName));
        });

        // Character counter for message field
        this.fields.message.addEventListener('input', () => this.updateCharacterCount());
        
        // Initialize character count
        this.updateCharacterCount();
    }

    validateField(fieldName) {
        const field = this.fields[fieldName];
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Clear previous error state
        this.clearFieldError(fieldName);

        // Required field validation
        if (!value) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(fieldName)} is required.`;
        } else {
            // Field-specific validation
            switch (fieldName) {
                case 'fullName':
                    if (value.length < 2) {
                        isValid = false;
                        errorMessage = 'Full name must be at least 2 characters long.';
                    } else if (!/^[a-zA-Z\s\-']+$/.test(value)) {
                        isValid = false;
                        errorMessage = 'Full name can only contain letters, spaces, hyphens, and apostrophes.';
                    }
                    break;

                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid email address.';
                    }
                    break;

                case 'subject':
                    if (value.length < 3) {
                        isValid = false;
                        errorMessage = 'Subject must be at least 3 characters long.';
                    } else if (value.length > 100) {
                        isValid = false;
                        errorMessage = 'Subject must be less than 100 characters.';
                    }
                    break;

                case 'message':
                    if (value.length < 20) {
                        isValid = false;
                        errorMessage = `Message must be at least 20 characters long. Current: ${value.length} characters.`;
                    } else if (value.length > 1000) {
                        isValid = false;
                        errorMessage = 'Message must be less than 1000 characters.';
                    }
                    break;
            }
        }

        if (!isValid) {
            this.showFieldError(fieldName, errorMessage);
        }

        return isValid;
    }

    validateAllFields() {
        let isFormValid = true;
        
        Object.keys(this.fields).forEach(fieldName => {
            const isFieldValid = this.validateField(fieldName);
            if (!isFieldValid) {
                isFormValid = false;
            }
        });

        return isFormValid;
    }

    showFieldError(fieldName, message) {
        const field = this.fields[fieldName];
        const errorElement = this.errorElements[fieldName];
        
        field.classList.add('error');
        errorElement.textContent = message;
        
        // Announce error to screen readers
        errorElement.setAttribute('aria-live', 'polite');
    }

    clearFieldError(fieldName) {
        const field = this.fields[fieldName];
        const errorElement = this.errorElements[fieldName];
        
        field.classList.remove('error');
        errorElement.textContent = '';
    }

    clearAllErrors() {
        Object.keys(this.fields).forEach(fieldName => {
            this.clearFieldError(fieldName);
        });
    }

    getFieldLabel(fieldName) {
        const labels = {
            fullName: 'Full Name',
            email: 'Email Address',
            subject: 'Subject',
            message: 'Message'
        };
        return labels[fieldName] || fieldName;
    }

    updateCharacterCount() {
        const messageLength = this.fields.message.value.length;
        this.charCount.textContent = messageLength;
        
        // Update color based on character count
        const charCountElement = this.charCount.parentElement;
        if (messageLength < 20) {
            charCountElement.style.color = 'var(--error-color)';
        } else {
            charCountElement.style.color = 'var(--text-secondary)';
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Hide success message if visible
        this.hideSuccessMessage();
        
        // Validate all fields
        const isValid = this.validateAllFields();
        
        if (!isValid) {
            // Focus on first field with error
            this.focusFirstErrorField();
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        try {
            // Simulate form submission delay
            await this.simulateFormSubmission();
            
            // Show success message
            this.showSuccessMessage();
            
            // Reset form
            this.resetForm();
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showGeneralError('An error occurred while sending your message. Please try again.');
        } finally {
            this.setLoadingState(false);
        }
    }

    async simulateFormSubmission() {
        // Simulate network delay
        return new Promise(resolve => setTimeout(resolve, 1500));
    }

    setLoadingState(isLoading) {
        const btnContent = this.submitBtn.querySelector('.btn-content');
        const btnLoading = this.submitBtn.querySelector('.btn-loading');
        
        if (isLoading) {
            this.submitBtn.disabled = true;
            btnContent.style.display = 'none';
            btnLoading.style.display = 'flex';
        } else {
            this.submitBtn.disabled = false;
            btnContent.style.display = 'flex';
            btnLoading.style.display = 'none';
        }
    }

    showSuccessMessage() {
        this.successMessage.style.display = 'block';
        this.successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            this.hideSuccessMessage();
        }, 5000);
    }

    hideSuccessMessage() {
        this.successMessage.style.display = 'none';
    }

    showGeneralError(message) {
        alert(message); // Simple fallback for demo
    }

    resetForm() {
        this.form.reset();
        this.clearAllErrors();
        this.updateCharacterCount();
        
        // Focus on first field for better UX
        this.fields.fullName.focus();
    }

    focusFirstErrorField() {
        for (const fieldName of Object.keys(this.fields)) {
            if (this.fields[fieldName].classList.contains('error')) {
                this.fields[fieldName].focus();
                break;
            }
        }
    }
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContactForm();
});

// Keyboard navigation enhancement
document.addEventListener('keydown', (e) => {
    // ESC key to clear success message
    if (e.key === 'Escape') {
        const successMessage = document.getElementById('successMessage');
        if (successMessage.style.display === 'block') {
            successMessage.style.display = 'none';
        }
    }
});