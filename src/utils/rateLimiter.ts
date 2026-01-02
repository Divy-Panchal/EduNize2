interface RateLimitEntry {
    attempts: number;
    lastAttempt: number;
    blockedUntil?: number;
}

const RATE_LIMIT_STORAGE_KEY = 'auth_rate_limit';
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes
const RESET_DURATION = 60 * 1000; // 1 minute

/**
 * Rate limiter to prevent brute force attacks
 */
export class RateLimiter {
    private static getEntry(key: string): RateLimitEntry {
        const stored = localStorage.getItem(`${RATE_LIMIT_STORAGE_KEY}_${key}`);
        if (!stored) {
            return { attempts: 0, lastAttempt: 0 };
        }
        try {
            return JSON.parse(stored);
        } catch {
            return { attempts: 0, lastAttempt: 0 };
        }
    }

    private static setEntry(key: string, entry: RateLimitEntry): void {
        localStorage.setItem(`${RATE_LIMIT_STORAGE_KEY}_${key}`, JSON.stringify(entry));
    }

    /**
     * Check if the action is allowed based on rate limiting
     */
    static checkLimit(key: string): { allowed: boolean; remainingTime?: number } {
        const entry = this.getEntry(key);
        const now = Date.now();

        // Check if currently blocked
        if (entry.blockedUntil && entry.blockedUntil > now) {
            return {
                allowed: false,
                remainingTime: Math.ceil((entry.blockedUntil - now) / 1000)
            };
        }

        // Reset attempts if enough time has passed
        if (now - entry.lastAttempt > RESET_DURATION) {
            entry.attempts = 0;
        }

        // Check if max attempts reached
        if (entry.attempts >= MAX_ATTEMPTS) {
            entry.blockedUntil = now + BLOCK_DURATION;
            this.setEntry(key, entry);
            return {
                allowed: false,
                remainingTime: Math.ceil(BLOCK_DURATION / 1000)
            };
        }

        return { allowed: true };
    }

    /**
     * Record a failed attempt
     */
    static recordAttempt(key: string): void {
        const entry = this.getEntry(key);
        entry.attempts += 1;
        entry.lastAttempt = Date.now();
        this.setEntry(key, entry);
    }

    /**
     * Reset the rate limit for a key (e.g., after successful login)
     */
    static reset(key: string): void {
        localStorage.removeItem(`${RATE_LIMIT_STORAGE_KEY}_${key}`);
    }
}
