let storageMode: 'cloud' | 'local' = 'local';

export function setStorageMode(mode: 'cloud' | 'local') {
    storageMode = mode;
}

export function getStorageMode() {
    return storageMode;
}
