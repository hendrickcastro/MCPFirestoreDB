export const MCP_FIRESTORE_TOOLS = [
    // CRUD Operations
    {
        name: 'create_doc',
        description: 'Create a new document in a Firestore collection',
        inputSchema: {
            type: 'object',
            properties: {
                collection_path: {
                    type: 'string',
                    description: 'The path to the collection (e.g., "users" or "users/123/orders")'
                },
                document_id: {
                    type: 'string',
                    description: 'Optional document ID. If not provided, Firestore will auto-generate one'
                },
                data: {
                    type: 'object',
                    description: 'The document data to create'
                }
            },
            required: ['collection_path', 'data']
        }
    },
    {
        name: 'get_doc',
        description: 'Get a specific document by ID from a Firestore collection',
        inputSchema: {
            type: 'object',
            properties: {
                collection_path: {
                    type: 'string',
                    description: 'The path to the collection'
                },
                document_id: {
                    type: 'string',
                    description: 'The ID of the document to retrieve'
                }
            },
            required: ['collection_path', 'document_id']
        }
    },
    {
        name: 'get_docs',
        description: 'Get multiple documents from a Firestore collection with optional filtering and pagination',
        inputSchema: {
            type: 'object',
            properties: {
                collection_path: {
                    type: 'string',
                    description: 'The path to the collection'
                },
                limit: {
                    type: 'number',
                    description: 'Maximum number of documents to return',
                    default: 100
                },
                order_by: {
                    type: 'string',
                    description: 'Field to order by'
                },
                order_direction: {
                    type: 'string',
                    enum: ['asc', 'desc'],
                    description: 'Order direction',
                    default: 'asc'
                },
                where_conditions: {
                    type: 'array',
                    description: 'Array of where conditions [field, operator, value]',
                    items: {
                        type: 'array',
                        minItems: 3,
                        maxItems: 3
                    }
                },
                start_after: {
                    type: 'string',
                    description: 'Document ID to start after for pagination'
                }
            },
            required: ['collection_path']
        }
    },
    {
        name: 'update_doc',
        description: 'Update an existing document in a Firestore collection',
        inputSchema: {
            type: 'object',
            properties: {
                collection_path: {
                    type: 'string',
                    description: 'The path to the collection'
                },
                document_id: {
                    type: 'string',
                    description: 'The ID of the document to update'
                },
                data: {
                    type: 'object',
                    description: 'The data to update (partial update supported)'
                },
                merge: {
                    type: 'boolean',
                    description: 'Whether to merge with existing data or replace',
                    default: true
                }
            },
            required: ['collection_path', 'document_id', 'data']
        }
    },
    {
        name: 'delete_doc',
        description: 'Delete a document from a Firestore collection',
        inputSchema: {
            type: 'object',
            properties: {
                collection_path: {
                    type: 'string',
                    description: 'The path to the collection'
                },
                document_id: {
                    type: 'string',
                    description: 'The ID of the document to delete'
                }
            },
            required: ['collection_path', 'document_id']
        }
    },
    // Batch Operations
    {
        name: 'batch_create',
        description: 'Create multiple documents in a single batch operation',
        inputSchema: {
            type: 'object',
            properties: {
                operations: {
                    type: 'array',
                    description: 'Array of create operations',
                    items: {
                        type: 'object',
                        properties: {
                            collection_path: { type: 'string' },
                            document_id: { type: 'string' },
                            data: { type: 'object' }
                        },
                        required: ['collection_path', 'data']
                    }
                }
            },
            required: ['operations']
        }
    },
    {
        name: 'batch_update',
        description: 'Update multiple documents in a single batch operation',
        inputSchema: {
            type: 'object',
            properties: {
                operations: {
                    type: 'array',
                    description: 'Array of update operations',
                    items: {
                        type: 'object',
                        properties: {
                            collection_path: { type: 'string' },
                            document_id: { type: 'string' },
                            data: { type: 'object' },
                            merge: { type: 'boolean', default: true }
                        },
                        required: ['collection_path', 'document_id', 'data']
                    }
                }
            },
            required: ['operations']
        }
    },
    {
        name: 'batch_delete',
        description: 'Delete multiple documents in a single batch operation',
        inputSchema: {
            type: 'object',
            properties: {
                operations: {
                    type: 'array',
                    description: 'Array of delete operations',
                    items: {
                        type: 'object',
                        properties: {
                            collection_path: { type: 'string' },
                            document_id: { type: 'string' }
                        },
                        required: ['collection_path', 'document_id']
                    }
                }
            },
            required: ['operations']
        }
    },
    // Collection Operations
    {
        name: 'list_collections',
        description: 'List all collections in the Firestore database',
        inputSchema: {
            type: 'object',
            properties: {
                parent_path: {
                    type: 'string',
                    description: 'Optional parent document path to list subcollections'
                }
            }
        }
    },
    {
        name: 'collection_stats',
        description: 'Get statistics about a Firestore collection',
        inputSchema: {
            type: 'object',
            properties: {
                collection_path: {
                    type: 'string',
                    description: 'The path to the collection'
                },
                sample_size: {
                    type: 'number',
                    description: 'Number of documents to sample for statistics',
                    default: 100
                }
            },
            required: ['collection_path']
        }
    },
    {
        name: 'analyze_schema',
        description: 'Analyze the schema of documents in a Firestore collection',
        inputSchema: {
            type: 'object',
            properties: {
                collection_path: {
                    type: 'string',
                    description: 'The path to the collection'
                },
                sample_size: {
                    type: 'number',
                    description: 'Number of documents to sample for schema analysis',
                    default: 100
                }
            },
            required: ['collection_path']
        }
    },
    {
        name: 'delete_collection',
        description: 'Delete an entire collection and all its documents (use with caution)',
        inputSchema: {
            type: 'object',
            properties: {
                collection_path: {
                    type: 'string',
                    description: 'The path to the collection to delete'
                },
                batch_size: {
                    type: 'number',
                    description: 'Number of documents to delete per batch',
                    default: 100
                }
            },
            required: ['collection_path']
        }
    },
    {
        name: 'create_index',
        description: 'Generate configuration for creating a composite index for Firestore queries',
        inputSchema: {
            type: 'object',
            properties: {
                collection_path: {
                    type: 'string',
                    description: 'The path to the collection for the index'
                },
                fields: {
                    type: 'array',
                    description: 'Array of fields to include in the index',
                    items: {
                        type: 'object',
                        properties: {
                            fieldPath: {
                                type: 'string',
                                description: 'The field path to index'
                            },
                            order: {
                                type: 'string',
                                enum: ['ASCENDING', 'DESCENDING'],
                                description: 'Sort order for the field',
                                default: 'ASCENDING'
                            },
                            arrayConfig: {
                                type: 'string',
                                enum: ['CONTAINS'],
                                description: 'Array configuration for array fields'
                            }
                        },
                        required: ['fieldPath']
                    }
                },
                query_scope: {
                    type: 'string',
                    enum: ['COLLECTION', 'COLLECTION_GROUP'],
                    description: 'Scope of the index query',
                    default: 'COLLECTION'
                }
            },
            required: ['collection_path', 'fields']
        }
    },
    {
        name: 'list_indexes',
        description: 'Get guidance on how to list existing Firestore indexes',
        inputSchema: {
            type: 'object',
            properties: {
                collection_path: {
                    type: 'string',
                    description: 'Optional collection path to filter indexes'
                }
            }
        }
    },
    {
        name: 'get_index_status',
        description: 'Get guidance on checking the status of a specific Firestore index',
        inputSchema: {
            type: 'object',
            properties: {
                index_name: {
                    type: 'string',
                    description: 'The name of the index to check'
                }
            },
            required: ['index_name']
        }
    },
    {
        name: 'parse_index_error',
        description: 'Parse Firestore query error messages to extract index creation information',
        inputSchema: {
            type: 'object',
            properties: {
                error_message: {
                    type: 'string',
                    description: 'The Firestore error message containing index requirements'
                }
            },
            required: ['error_message']
        }
    },
    {
        name: 'generate_indexes_config',
        description: 'Generate firestore.indexes.json configuration for Firebase CLI deployment',
        inputSchema: {
            type: 'object',
            properties: {
                indexes: {
                    type: 'array',
                    description: 'Array of index configurations',
                    items: {
                        type: 'object',
                        properties: {
                            collection_path: {
                                type: 'string',
                                description: 'The collection path for the index'
                            },
                            fields: {
                                type: 'array',
                                description: 'Array of fields for the index',
                                items: {
                                    type: 'object',
                                    properties: {
                                        fieldPath: {
                                            type: 'string',
                                            description: 'The field path'
                                        },
                                        order: {
                                            type: 'string',
                                            enum: ['ASCENDING', 'DESCENDING'],
                                            default: 'ASCENDING'
                                        },
                                        arrayConfig: {
                                            type: 'string',
                                            enum: ['CONTAINS']
                                        }
                                    },
                                    required: ['fieldPath']
                                }
                            },
                            query_scope: {
                                type: 'string',
                                enum: ['COLLECTION', 'COLLECTION_GROUP'],
                                default: 'COLLECTION'
                            }
                        },
                        required: ['collection_path', 'fields']
                    }
                }
            },
            required: ['indexes']
        }
    }
];
