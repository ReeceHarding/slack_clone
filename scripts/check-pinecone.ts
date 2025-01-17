import { Pinecone } from '@pinecone-database/pinecone';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function clearPineconeIndex() {
  try {
    // Initialize Pinecone client
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const indexName = process.env.PINECONE_INDEX!;
    console.log('Clearing data from Pinecone index:', indexName);

    // Get the index
    const index = pinecone.index(indexName);

    // Delete all vectors (this preserves the index structure)
    await index.deleteAll();
    
    console.log('Successfully deleted all vectors from the index');
    
    // Verify the deletion by checking vector count
    const description = await pinecone.describeIndex(indexName);
    console.log('\nIndex Description after clearing:');
    console.log(JSON.stringify(description, null, 2));

    // Perform a sample query to verify empty state
    const queryResponse = await index.query({
      vector: Array(3072).fill(0),
      topK: 1,
      includeMetadata: true,
    });

    console.log('\nVerification Query Response (should show no matches):');
    console.log(JSON.stringify(queryResponse, null, 2));

  } catch (error) {
    console.error('Error clearing Pinecone index:', error);
  }
}

clearPineconeIndex();
