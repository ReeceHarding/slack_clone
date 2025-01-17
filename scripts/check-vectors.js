const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config({ path: '.env.local' });

async function checkVectors() {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
  });
  const index = pinecone.index(process.env.PINECONE_INDEX);
  
  // Do a sample query to see what vectors we have
  const queryResponse = await index.query({
    vector: Array(3072).fill(0),
    topK: 10,
    includeMetadata: true,
  });
  console.log('\nSample query results:', JSON.stringify(queryResponse, null, 2));
}

checkVectors(); 