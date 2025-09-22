import { ToolResult, DocumentInfo, CreateDocumentOptions, UpdateDocumentOptions, QueryOptions, QueryResult, BatchOperationResult } from './types.js';
import { DocumentData } from '@google-cloud/firestore';
export declare const mcp_create_document: (params: {
    collection_path: string;
    document_id?: string;
    data: DocumentData;
    options?: CreateDocumentOptions;
}) => Promise<ToolResult<DocumentInfo>>;
export declare const mcp_get_document: (params: {
    collection_path: string;
    document_id: string;
}) => Promise<ToolResult<DocumentInfo | null>>;
export declare const mcp_get_documents: (params: {
    collection_path: string;
    query_options?: QueryOptions;
}) => Promise<ToolResult<QueryResult>>;
export declare const mcp_update_document: (params: {
    collection_path: string;
    document_id: string;
    data: DocumentData;
    options?: UpdateDocumentOptions;
}) => Promise<ToolResult<DocumentInfo>>;
export declare const mcp_delete_document: (params: {
    collection_path: string;
    document_id: string;
}) => Promise<ToolResult<{
    deleted: boolean;
    documentId: string;
}>>;
export declare const mcp_batch_create_documents: (params: {
    collection_path: string;
    documents: Array<{
        id?: string;
        data: DocumentData;
    }>;
}) => Promise<ToolResult<BatchOperationResult>>;
export declare const mcp_batch_update_documents: (params: {
    collection_path: string;
    updates: Array<{
        id: string;
        data: DocumentData;
    }>;
}) => Promise<ToolResult<BatchOperationResult>>;
export declare const mcp_batch_delete_documents: (params: {
    collection_path: string;
    document_ids: string[];
}) => Promise<ToolResult<BatchOperationResult>>;
