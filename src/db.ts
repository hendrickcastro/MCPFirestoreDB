import { Firestore, Settings } from '@google-cloud/firestore';
import dotenv from 'dotenv';

dotenv.config();

let firestoreClient: Firestore | null = null;

// Helper function to write to stderr (MCP compliant - keeps stdout clean for JSON-RPC)
const log = (message: string): void => {
  process.stderr.write(`${message}\n`);
};

// Helper function to parse boolean values
const parseBoolean = (value: string | undefined, defaultValue: boolean = false): boolean => {
  if (!value) return defaultValue;
  return ['true', 'yes', '1', 'on'].includes(value.toLowerCase());
};

// Build Firestore configuration
const buildConfig = (): Settings => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const databaseId = process.env.FIRESTORE_DATABASE_ID || '(default)';
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
  
  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID environment variable is required');
  }

  const config: Settings = {
    projectId,
    databaseId,
  };

  // Configure credentials if not using emulator
  if (!emulatorHost && credentialsPath) {
    config.keyFilename = credentialsPath;
  }

  // Configure emulator if specified
  if (emulatorHost) {
    config.host = emulatorHost;
    config.ssl = false;
    log(`Using Firestore emulator at ${emulatorHost}`);
  }

  return config;
};

// Connect to Firestore
export const connectFirestore = async (): Promise<void> => {
  try {
    if (firestoreClient) {
      log('Firestore client already connected');
      return;
    }

    const config = buildConfig();
    firestoreClient = new Firestore(config);

    // Test the connection by attempting to list collections
    await firestoreClient.listCollections();
    
    log(`Connected to Firestore successfully`);
    log(`Project ID: ${config.projectId}`);
    log(`Database ID: ${config.databaseId}`);
    
  } catch (error: any) {
    log(`Failed to connect to Firestore: ${error.message}`);
    throw new Error(`Firestore connection failed: ${error.message}`);
  }
};

// Get Firestore client instance
export const getFirestoreClient = (): Firestore => {
  if (!firestoreClient) {
    throw new Error('Firestore client not initialized. Call connectFirestore() first.');
  }
  return firestoreClient;
};

// Get a collection reference
export const getCollection = (collectionPath: string) => {
  const client = getFirestoreClient();
  return client.collection(collectionPath);
};

// Get a document reference
export const getDocument = (collectionPath: string, documentId: string) => {
  const collection = getCollection(collectionPath);
  return collection.doc(documentId);
};

// Close Firestore connection
export const closeConnection = async (): Promise<void> => {
  try {
    if (firestoreClient) {
      await firestoreClient.terminate();
      firestoreClient = null;
      log('Firestore connection closed');
    }
  } catch (error: any) {
    log(`Error closing Firestore connection: ${error.message}`);
  }
};

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  log('Received SIGINT, closing Firestore connection...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('Received SIGTERM, closing Firestore connection...');
  await closeConnection();
  process.exit(0);
});
