import { Firestore } from '@google-cloud/firestore';
export declare const connectFirestore: () => Promise<void>;
export declare const getFirestoreClient: () => Firestore;
export declare const getCollection: (collectionPath: string) => FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData>;
export declare const getDocument: (collectionPath: string, documentId: string) => FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData>;
export declare const closeConnection: () => Promise<void>;
