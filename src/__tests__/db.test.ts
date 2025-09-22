import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { connectFirestore, getFirestoreClient, closeConnection } from '../db';

// Mock the Firestore module
jest.mock('@google-cloud/firestore', () => {
  return {
    Firestore: jest.fn().mockImplementation(() => ({
      settings: jest.fn(),
      terminate: jest.fn()
    }))
  };
});

describe('Firestore Database Connection', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset environment variables
    delete process.env.FIREBASE_PROJECT_ID;
    delete process.env.FIRESTORE_DATABASE_ID;
    delete process.env.FIRESTORE_EMULATOR_HOST;
    delete process.env.DEBUG_FIRESTORE;
  });

  afterEach(async () => {
    // Clean up connections after each test
    await closeConnection();
  });

  describe('connectFirestore', () => {
    it('should connect successfully with valid configuration', async () => {
      process.env.FIREBASE_PROJECT_ID = 'test-project';
      
      await expect(connectFirestore()).resolves.not.toThrow();
    });

    it('should throw error when FIREBASE_PROJECT_ID is missing', async () => {
      await expect(connectFirestore()).rejects.toThrow('FIREBASE_PROJECT_ID is required');
    });

    it('should use emulator when FIRESTORE_EMULATOR_HOST is set', async () => {
      process.env.FIREBASE_PROJECT_ID = 'test-project';
      process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
      
      await expect(connectFirestore()).resolves.not.toThrow();
    });

    it('should use custom database ID when provided', async () => {
      process.env.FIREBASE_PROJECT_ID = 'test-project';
      process.env.FIRESTORE_DATABASE_ID = 'custom-db';
      
      await expect(connectFirestore()).resolves.not.toThrow();
    });
  });

  describe('getFirestoreClient', () => {
    it('should return client after connection', async () => {
      process.env.FIREBASE_PROJECT_ID = 'test-project';
      
      await connectFirestore();
      const client = getFirestoreClient();
      
      expect(client).toBeDefined();
    });

    it('should throw error when not connected', () => {
      expect(() => getFirestoreClient()).toThrow('Firestore client not initialized');
    });
  });

  describe('closeConnection', () => {
    it('should close connection successfully', async () => {
      process.env.FIREBASE_PROJECT_ID = 'test-project';
      
      await connectFirestore();
      await expect(closeConnection()).resolves.not.toThrow();
    });

    it('should handle multiple close calls gracefully', async () => {
      process.env.FIREBASE_PROJECT_ID = 'test-project';
      
      await connectFirestore();
      await closeConnection();
      await expect(closeConnection()).resolves.not.toThrow();
    });
  });
});