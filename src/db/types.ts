export type SyncStatus = 'synced' | 'pending_create' | 'pending_update' | 'pending_delete';

export type WithSync<T> = T & {
  syncStatus?: SyncStatus;
  lastUpdated?: number; // timestamp
};
