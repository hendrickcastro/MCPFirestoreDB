import { Firestore } from '@google-cloud/firestore';
import { getFirestoreClient } from '../db.js';

// Types for index operations
export interface IndexField {
  fieldPath: string;
  order?: 'ASCENDING' | 'DESCENDING';
  arrayConfig?: 'CONTAINS';
}

export interface CreateIndexParams {
  collection_path: string;
  fields: IndexField[];
  query_scope?: 'COLLECTION' | 'COLLECTION_GROUP';
}

export interface ListIndexesParams {
  collection_path?: string;
}

export interface GetIndexParams {
  index_name: string;
}

export interface DeleteIndexParams {
  index_name: string;
}

/**
 * Create a composite index for Firestore queries
 * Note: This function creates the index definition but actual index creation
 * requires Firebase CLI or console due to security restrictions
 */
export const mcp_create_index = async (params: CreateIndexParams): Promise<any> => {
  try {
    const db = getFirestoreClient();
    
    if (!params.collection_path || !params.fields || params.fields.length === 0) {
      throw new Error('collection_path and fields are required');
    }

    // Validate fields
    for (const field of params.fields) {
      if (!field.fieldPath) {
        throw new Error('Each field must have a fieldPath');
      }
    }

    // Generate index configuration
    const indexConfig = {
      collectionGroup: params.collection_path,
      queryScope: params.query_scope || 'COLLECTION',
      fields: params.fields.map(field => ({
        fieldPath: field.fieldPath,
        order: field.order || 'ASCENDING',
        ...(field.arrayConfig && { arrayConfig: field.arrayConfig })
      }))
    };

    // Generate Firebase CLI command for index creation
    const cliCommand = `firebase firestore:indexes`;
    const indexDefinition = {
      indexes: [{
        collectionGroup: params.collection_path,
        queryScope: params.query_scope || 'COLLECTION',
        fields: params.fields
      }]
    };

    // Generate console URL for manual index creation
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const consoleUrl = `https://console.firebase.google.com/project/${projectId}/firestore/indexes`;

    return {
      success: true,
      message: 'Index configuration generated. Use Firebase CLI or console to create the actual index.',
      indexConfig,
      indexDefinition,
      cliCommand,
      consoleUrl,
      instructions: [
        '1. Save the indexDefinition to firestore.indexes.json',
        '2. Run: firebase deploy --only firestore:indexes',
        '3. Or visit the console URL to create manually'
      ]
    };
  } catch (error: any) {
    throw new Error(`Failed to generate index configuration: ${error.message}`);
  }
};

/**
 * List existing indexes (simulated - requires Firebase Admin SDK with special permissions)
 * This function provides guidance on how to check indexes
 */
export const mcp_list_indexes = async (params: ListIndexesParams = {}): Promise<any> => {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    
    // Since we can't directly list indexes with standard Firestore SDK,
    // we provide guidance and tools for checking indexes
    const consoleUrl = `https://console.firebase.google.com/project/${projectId}/firestore/indexes`;
    const cliCommands = [
      'firebase firestore:indexes',
      'gcloud firestore indexes list'
    ];

    return {
      success: true,
      message: 'Index listing requires Firebase console or CLI access',
      consoleUrl,
      cliCommands,
      instructions: [
        '1. Visit the Firebase console to view all indexes',
        '2. Use Firebase CLI: firebase firestore:indexes',
        '3. Use gcloud CLI: gcloud firestore indexes list',
        '4. Check firestore.indexes.json in your project'
      ],
      note: 'Direct programmatic access to index listing requires Firebase Admin SDK with elevated permissions'
    };
  } catch (error: any) {
    throw new Error(`Failed to provide index listing guidance: ${error.message}`);
  }
};

/**
 * Get index status and information
 * Provides guidance on checking specific index status
 */
export const mcp_get_index_status = async (params: GetIndexParams): Promise<any> => {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    
    if (!params.index_name) {
      throw new Error('index_name is required');
    }

    const consoleUrl = `https://console.firebase.google.com/project/${projectId}/firestore/indexes`;
    const cliCommand = `gcloud firestore indexes describe ${params.index_name}`;

    return {
      success: true,
      message: `Guidance for checking index status: ${params.index_name}`,
      indexName: params.index_name,
      consoleUrl,
      cliCommand,
      instructions: [
        '1. Visit Firebase console to check index status',
        '2. Look for "Building" or "Ready" status',
        '3. Use gcloud CLI for detailed information',
        '4. Check for any error messages in console'
      ],
      statusTypes: {
        'READY': 'Index is built and ready for queries',
        'BUILDING': 'Index is currently being built',
        'ERROR': 'Index creation failed - check console for details'
      }
    };
  } catch (error: any) {
    throw new Error(`Failed to provide index status guidance: ${error.message}`);
  }
};

/**
 * Generate index from query error
 * Parses Firestore query error messages to extract index creation links
 */
export const mcp_parse_index_error = async (params: { error_message: string }): Promise<any> => {
  try {
    if (!params.error_message) {
      throw new Error('error_message is required');
    }

    // Extract index creation URL from error message
    const urlRegex = /https:\/\/console\.firebase\.google\.com\/[^\s]+/g;
    const urls = params.error_message.match(urlRegex);

    // Extract query information
    const queryRegex = /The query requires an index/i;
    const isIndexError = queryRegex.test(params.error_message);

    if (!isIndexError) {
      return {
        success: false,
        message: 'This does not appear to be a Firestore index error',
        isIndexError: false
      };
    }

    return {
      success: true,
      message: 'Index error parsed successfully',
      isIndexError: true,
      indexCreationUrls: urls || [],
      errorMessage: params.error_message,
      instructions: [
        '1. Click on the provided URL to create the required index',
        '2. Wait for index to build (can take several minutes)',
        '3. Retry your query after index is ready',
        '4. Consider adding the index to firestore.indexes.json for deployment'
      ],
      tip: 'Save index definitions to firestore.indexes.json to deploy with Firebase CLI'
    };
  } catch (error: any) {
    throw new Error(`Failed to parse index error: ${error.message}`);
  }
};

/**
 * Generate firestore.indexes.json configuration
 * Creates a properly formatted indexes file for Firebase CLI deployment
 */
export const mcp_generate_indexes_config = async (params: { indexes: CreateIndexParams[] }): Promise<any> => {
  try {
    if (!params.indexes || !Array.isArray(params.indexes)) {
      throw new Error('indexes array is required');
    }

    const indexesConfig = {
      indexes: params.indexes.map(index => ({
        collectionGroup: index.collection_path,
        queryScope: index.query_scope || 'COLLECTION',
        fields: index.fields.map(field => ({
          fieldPath: field.fieldPath,
          order: field.order || 'ASCENDING',
          ...(field.arrayConfig && { arrayConfig: field.arrayConfig })
        }))
      }))
    };

    const configJson = JSON.stringify(indexesConfig, null, 2);

    return {
      success: true,
      message: 'Firestore indexes configuration generated',
      config: indexesConfig,
      configJson,
      filename: 'firestore.indexes.json',
      deployCommand: 'firebase deploy --only firestore:indexes',
      instructions: [
        '1. Save the configuration to firestore.indexes.json',
        '2. Run: firebase deploy --only firestore:indexes',
        '3. Monitor index building progress in Firebase console',
        '4. Test queries after indexes are ready'
      ]
    };
  } catch (error: any) {
    throw new Error(`Failed to generate indexes configuration: ${error.message}`);
  }
};