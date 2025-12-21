import { db } from '../schema';
import { appwriteDbHelpers } from '../appwriteDb';
import type { WorkoutLog } from '@/types';
import { getStorageMode } from '../config';

export const WorkoutRepository = {
    async getWorkoutsByUser(userId: string, limit?: number) {
        if (navigator.onLine && getStorageMode() === 'cloud') {
            try {
                const workouts = await appwriteDbHelpers.getWorkoutsByUser(userId, limit);
                // Cache
                await db.workouts.bulkPut(workouts.map(w => ({ ...w, syncStatus: 'synced' as const, lastUpdated: Date.now() })));
                return workouts;
            } catch (error) {
                console.warn('Error fetching workouts from cloud:', error);
            }
        }

        let query = db.workouts
            .where('userId').equals(userId)
            .reverse()
            .sortBy('fecha');

        const workouts = await query;
        return limit ? workouts.slice(0, limit) : workouts;
    },

    async logWorkout(workout: WorkoutLog) {
        const timestamp = Date.now();
        if (navigator.onLine) {
            try {
                const id = await appwriteDbHelpers.logWorkout(workout);
                await db.workouts.put({ ...workout, id, syncStatus: 'synced', lastUpdated: timestamp });
                return id;
            } catch (error) {
                console.error('Error logging workout to cloud:', error);
                await db.workouts.put({ ...workout, syncStatus: 'pending_create', lastUpdated: timestamp });
                return workout.id;
            }
        } else {
            await db.workouts.put({ ...workout, syncStatus: 'pending_create', lastUpdated: timestamp });
            return workout.id;
        }
    },

    async updateWorkout(id: string, updates: Partial<WorkoutLog>) {
        const timestamp = Date.now();
        if (navigator.onLine) {
            try {
                await appwriteDbHelpers.updateWorkout(id, updates);
                await db.workouts.update(id, { ...updates, syncStatus: 'synced', lastUpdated: timestamp });
                return id;
            } catch (error) {
                console.error('Error updating workout in cloud:', error);
                await db.workouts.update(id, { ...updates, syncStatus: 'pending_update', lastUpdated: timestamp });
                return id;
            }
        } else {
            await db.workouts.update(id, { ...updates, syncStatus: 'pending_update', lastUpdated: timestamp });
            return id;
        }
    },

    async getPendingSync() {
        return await db.workouts
            .filter(w => w.syncStatus !== 'synced' && w.syncStatus !== undefined)
            .toArray();
    },

    async getWorkoutsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<WorkoutLog[]> {
        const allWorkouts = await db.workouts
            .where('userId')
            .equals(userId)
            .toArray();

        return allWorkouts.filter(w => {
            const workoutDate = new Date(w.fecha);
            return workoutDate >= startDate && workoutDate <= endDate;
        }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }
};
