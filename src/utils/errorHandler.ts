/**
 * Secure error handler that prevents exposing sensitive information
 */
export const handleError = (error: any): string => {
    // In production, don't expose detailed error messages
    if (import.meta.env.PROD) {
        // TODO: Log to error tracking service (e.g., Sentry)
        // logToSentry(error);

        return 'An unexpected error occurred. Please try again later.';
    }

    // In development, show detailed errors
    return error?.message || 'An error occurred';
};

/**
 * Sanitize error messages to remove sensitive information
 */
export const sanitizeErrorMessage = (message: string): string => {
    // Remove file paths
    message = message.replace(/\/[^\s]+/g, '[PATH]');

    // Remove email addresses
    message = message.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]');

    // Remove API keys or tokens (common patterns)
    message = message.replace(/[a-zA-Z0-9]{32,}/g, '[TOKEN]');

    return message;
};
