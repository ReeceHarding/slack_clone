# Lessons Learned

## Pinecone Integration

### API Changes and Version Compatibility
1. The Pinecone SDK v4 has significant changes from previous versions:
   - The client initialization no longer requires the `environment` parameter
   - Method names have changed (e.g., `Index()` → `index()`, `describeIndexStats()` → `describeIndex()`)
   - The serverless index creation parameters have been simplified

### Best Practices
1. **Environment Variables**
   - Required variables:
     - `PINECONE_API_KEY`: For authentication
     - `PINECONE_INDEX`: Name of the index to use
   - Optional variables:
     - `PINECONE_ENVIRONMENT`: No longer needed in v4

2. **Error Handling**
   - Implement detailed error logging with cause chain tracking
   - Check for environment variables before initializing clients
   - Log API responses for debugging
   - Convert IDs to strings when using as Pinecone vector IDs

3. **Index Configuration**
   - For text-embedding-3-large model:
     - Dimension: 3072
     - Metric: cosine
     - Type: serverless (recommended for free tier)
     - Cloud: aws
     - Region: us-east-1

4. **Testing**
   - Create a test script to verify:
     - Environment variables
     - Client initialization
     - Index existence and configuration
     - Vector operations (upsert, query)
   - Test with a simple vector before integrating with actual data

### Common Issues and Solutions
1. **Connection Reset Errors**
   - Usually indicates incorrect configuration or network issues
   - Verify API key and index name
   - Check Pinecone service status at status.pinecone.io

2. **Type Errors**
   - The TypeScript types may lag behind API changes
   - Use the official documentation as the source of truth
   - Consider using type assertions temporarily if types are outdated

3. **Index Creation**
   - Free tier has limitations on pod-based indexes
   - Use serverless indexes for development and testing
   - Verify index dimension matches your embedding model

### Code Examples

#### Client Initialization
```typescript
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});
```

#### Index Operations
```typescript
// Get index
const index = pinecone.index(indexName);

// Describe index
const description = await pinecone.describeIndex(indexName);

// Upsert vector
await index.upsert([{
  id: 'vector-id',
  values: embedding,
  metadata: {
    text: 'Sample text',
    // ... other metadata
  }
}]);
```

### Resources
- [Pinecone Documentation](https://docs.pinecone.io/)
- [Node.js SDK Reference](https://sdk.pinecone.io/typescript/)
- [Pinecone Status Page](https://status.pinecone.io/)
