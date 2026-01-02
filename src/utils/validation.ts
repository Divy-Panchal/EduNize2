import DOMPurify from 'dompurify';

/**
 * Sanitizes user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

/**
 * Validates email format
 */
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validates password strength
 */
export const validatePassword = (password: string): {
    isValid: boolean;
    errors: string[];
} => {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*)');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validates phone number format
 */
export const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
};

/**
 * Validates that a string contains only alphanumeric characters and spaces
 */
export const validateAlphanumeric = (input: string): boolean => {
    const alphanumericRegex = /^[a-zA-Z0-9\s]+$/;
    return alphanumericRegex.test(input);
};

/**
 * Validates that input is not empty and within length limits
 */
export const validateLength = (
    input: string,
    minLength: number = 1,
    maxLength: number = 255
): { isValid: boolean; error?: string } => {
    if (input.length < minLength) {
        return {
            isValid: false,
            error: `Input must be at least ${minLength} characters long`
        };
    }
    if (input.length > maxLength) {
        return {
            isValid: false,
            error: `Input must not exceed ${maxLength} characters`
        };
    }
    return { isValid: true };
};
