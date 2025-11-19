import '@testing-library/jest-dom'
import { vi, afterEach } from 'vitest'

// Mock de import.meta.env
vi.stubGlobal('import.meta', {
  env: {
    DEV: true,
    PROD: false,
    VITE_GROQ_API_KEY: 'test-key',
    VITE_GROQ_MODEL: 'test-model',
    VITE_APPWRITE_ENDPOINT: 'https://test.appwrite.io/v1',
    VITE_APPWRITE_PROJECT_ID: 'test-project',
    VITE_APPWRITE_DATABASE_ID: 'test-db',
  },
})

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
vi.stubGlobal('localStorage', localStorageMock)

// Mock de IndexedDB (para Dexie)
vi.mock('dexie', () => ({
  default: class MockDexie {
    version() { return this }
    stores() { return this }
  },
}))

// Limpiar mocks después de cada test
afterEach(() => {
  vi.clearAllMocks()
})
