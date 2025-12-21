import { db } from '../schema';
import { appwriteDbHelpers } from '../appwriteDb';
import type { UserProfile } from '@/types';
import type { WithSync } from '../types';
import { getStorageMode } from '../config';

export const UserRepository = {
    async getCurrentUser(): Promise<WithSync<UserProfile> | undefined> {
        if (navigator.onLine && getStorageMode() === 'cloud') {
            try {
                const user = await appwriteDbHelpers.getCurrentUser();
                if (user) {
                    // Update cache
                    await db.users.put({ ...user, syncStatus: 'synced', lastUpdated: Date.now() });
                    return { ...user, syncStatus: 'synced' };
                }
            } catch (error) {
                console.warn('Error fetching user from cloud, using cache:', error);
            }
        }

        // Fallback to local
        const users = await db.users.toArray();
        return users[0];
    },

    async createOrUpdateUser(user: UserProfile): Promise<string> {
        const timestamp = Date.now();

        if (navigator.onLine && getStorageMode() === 'cloud') {
            try {
                await appwriteDbHelpers.createOrUpdateUser(user);
                await db.users.put({ ...user, syncStatus: 'synced', lastUpdated: timestamp });
                return user.id;
            } catch (error) {
                console.error('Error saving user to cloud:', error);
                await db.users.put({ ...user, syncStatus: 'pending_update', lastUpdated: timestamp });
                return user.id;
            }
        } else {
            await db.users.put({ ...user, syncStatus: 'pending_update', lastUpdated: timestamp });
            return user.id;
        }
    },

    async getPendingSync() {
        return await db.users
            .filter(u => u.syncStatus !== 'synced' && u.syncStatus !== undefined)
            .toArray();
    },

    async updateUser(user: UserProfile): Promise<string> {
        // updateUser es un alias de createOrUpdateUser para mayor claridad en el código
        return await UserRepository.createOrUpdateUser(user);
    }
};
