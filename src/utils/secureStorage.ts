import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_STORAGE_ENCRYPTION_KEY || 'edunize-default-key-2024';

/**
 * Secure storage utility with encryption for sensitive data
 */
export const secureStorage = {
    /**
     * Encrypt and store data in localStorage
     */
    setItem: (key: string, value: any): void => {
        try {
            const encrypted = CryptoJS.AES.encrypt(
                JSON.stringify(value),
                SECRET_KEY
            ).toString();
            localStorage.setItem(key, encrypted);
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Failed to encrypt and store data:', error);
            }
        }
    },

    /**
     * Retrieve and decrypt data from localStorage
     */
    getItem: <T>(key: string): T | null => {
        const encrypted = localStorage.getItem(key);
        if (!encrypted) return null;

        try {
            const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
            const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
            if (!decryptedString) return null;
            return JSON.parse(decryptedString) as T;
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('Failed to decrypt data:', error);
            }
            return null;
        }
    },

    /**
     * Remove item from localStorage
     */
    removeItem: (key: string): void => {
        localStorage.removeItem(key);
    },

    /**
     * Clear all items from localStorage
     */
    clear: (): void => {
        localStorage.clear();
    }
};
