// Timetable state persistence utility
// Fixes BUG-013: Timetable week persistence

const TIMETABLE_STATE_KEY = 'timetable_view_state';

export interface TimetableViewState {
    viewMode: 'week' | 'month';
    currentWeekOffset: number;
    currentMonth: Date;
}

export class TimetableStateManager {
    /**
     * Save timetable view state
     */
    static saveState(state: TimetableViewState): void {
        try {
            localStorage.setItem(TIMETABLE_STATE_KEY, JSON.stringify({
                ...state,
                currentMonth: state.currentMonth.toISOString()
            }));
        } catch (error) {
            console.error('Failed to save timetable state:', error);
        }
    }

    /**
     * Load timetable view state
     */
    static loadState(): TimetableViewState | null {
        try {
            const saved = localStorage.getItem(TIMETABLE_STATE_KEY);
            if (!saved) return null;

            const parsed = JSON.parse(saved);
            return {
                ...parsed,
                currentMonth: new Date(parsed.currentMonth)
            };
        } catch (error) {
            console.error('Failed to load timetable state:', error);
            return null;
        }
    }

    /**
     * Clear timetable state
     */
    static clearState(): void {
        try {
            localStorage.removeItem(TIMETABLE_STATE_KEY);
        } catch (error) {
            console.error('Failed to clear timetable state:', error);
        }
    }
}
