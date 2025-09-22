import { Firestore } from '@google-cloud/firestore';
import dotenv from 'dotenv';
dotenv.config();
let firestoreClient = null;
// Helper function to parse boolean values
const parseBoolean = (value, defaultValue = false) => {
    if (!value)
        return defaultValue;
    return ['true', 'yes', '1', 'on'].includes(value.toLowerCase());
};
// Build Firestore configuration
const buildConfig = () => {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const databaseId = process.env.FIRESTORE_DATABASE_ID || '(default)';
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
    if (!projectId) {
        throw new Error('FIREBASE_PROJECT_ID environment variable is required');
    }
    const config = {
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
        console.log(`🔧 Using Firestore emulator at ${emulatorHost}`);
    }
    return config;
};
// Connect to Firestore
export const connectFirestore = async () => {
    try {
        if (firestoreClient) {
            console.log('✅ Firestore client already connected');
            return;
        }
        const config = buildConfig();
        firestoreClient = new Firestore(config);
        // Test the connection by attempting to list collections
        await firestoreClient.listCollections();
        console.log(`✅ Connected to Firestore successfully`);
        console.log(`📊 Project ID: ${config.projectId}`);
        console.log(`🗄️  Database ID: ${config.databaseId}`);
    }
    catch (error) {
        console.error('❌ Failed to connect to Firestore:', error.message);
        throw new Error(`Firestore connection failed: ${error.message}`);
    }
};
// Get Firestore client instance
export const getFirestoreClient = () => {
    if (!firestoreClient) {
        throw new Error('Firestore client not initialized. Call connectFirestore() first.');
    }
    return firestoreClient;
};
// Get a collection reference
export const getCollection = (collectionPath) => {
    const client = getFirestoreClient();
    return client.collection(collectionPath);
};
// Get a document reference
export const getDocument = (collectionPath, documentId) => {
    const collection = getCollection(collectionPath);
    return collection.doc(documentId);
};
// Close Firestore connection
export const closeConnection = async () => {
    try {
        if (firestoreClient) {
            await firestoreClient.terminate();
            firestoreClient = null;
            console.log('🔌 Firestore connection closed');
        }
    }
    catch (error) {
        console.error('❌ Error closing Firestore connection:', error.message);
    }
};
// Graceful shutdown handlers
process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, closing Firestore connection...');
    await closeConnection();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, closing Firestore connection...');
    await closeConnection();
    process.exit(0);
});
