// Achievement Helper Functions
// This utility provides functions to check and update time-based achievements

/**
 * Get the current time of day category
 * @returns 'morning' (before 8 AM), 'afternoon' (8 AM - 10 PM), or 'night' (after 10 PM)
 */
export function getTimeOfDay(): 'morning' | 'afternoon' | 'night' {
    const hour = new Date().getHours();

    if (hour < 8) {
        return 'morning';
    } else if (hour >= 22) {
        return 'night';
    } else {
        return 'afternoon';
    }
}

/**
 * Update Early Bird or Night Owl achievement progress
 * @param userId - The user's UID
 * @param timeOfDay - The time category when the activity occurred
 */
export function updateTimeBasedAchievements(userId: string, timeOfDay: 'morning' | 'afternoon' | 'night'): void {
    if (!userId) return;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    if (timeOfDay === 'morning') {
        // Update Early Bird achievements
        const earlyBirdKey = `earlyBird_${userId}`;
        const earlyBirdData = JSON.parse(localStorage.getItem(earlyBirdKey) || '{"dates": []}');

        if (!earlyBirdData.dates.includes(today)) {
            earlyBirdData.dates.push(today);
            localStorage.setItem(earlyBirdKey, JSON.stringify(earlyBirdData));
        }
    } else if (timeOfDay === 'night') {
        // Update Night Owl achievements
        const nightOwlKey = `nightOwl_${userId}`;
        const nightOwlData = JSON.parse(localStorage.getItem(nightOwlKey) || '{"dates": []}');

        if (!nightOwlData.dates.includes(today)) {
            nightOwlData.dates.push(today);
            localStorage.setItem(nightOwlKey, JSON.stringify(nightOwlData));
        }
    }

    // Trigger achievement check
    setTimeout(() => {
        window.dispatchEvent(new CustomEvent('checkAchievements'));
    }, 100);
}

/**
 * Get the count of unique days for a time-based achievement
 * @param userId - The user's UID
 * @param type - 'earlyBird' or 'nightOwl'
 * @returns Number of unique days
 */
export function getTimeBasedAchievementCount(userId: string, type: 'earlyBird' | 'nightOwl'): number {
    if (!userId) return 0;

    const key = `${type}_${userId}`;
    const data = JSON.parse(localStorage.getItem(key) || '{"dates": []}');
    return data.dates.length;
}

/**
 * Update daily task completion counter
 * @param userId - The user's UID
 * @param increment - Whether to increment (true) or decrement (false)
 */
export function updateDailyTaskCount(userId: string, increment: boolean): void {
    if (!userId) return;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const key = `dailyTasks_${userId}`;
    const data = JSON.parse(localStorage.getItem(key) || '{"date": "", "count": 0}');

    // Reset if it's a new day
    if (data.date !== today) {
        data.date = today;
        data.count = 0;
    }

    // Update count
    if (increment) {
        data.count++;
    } else {
        data.count = Math.max(0, data.count - 1);
    }

    localStorage.setItem(key, JSON.stringify(data));

    // Trigger achievement check
    setTimeout(() => {
        window.dispatchEvent(new CustomEvent('checkAchievements'));
    }, 100);
}

/**
 * Get today's task completion count
 * @param userId - The user's UID
 * @returns Number of tasks completed today
 */
export function getDailyTaskCount(userId: string): number {
    if (!userId) return 0;

    const today = new Date().toISOString().split('T')[0];
    const key = `dailyTasks_${userId}`;
    const data = JSON.parse(localStorage.getItem(key) || '{"date": "", "count": 0}');

    // Return 0 if it's not today's data
    if (data.date !== today) {
        return 0;
    }

    return data.count;
}
