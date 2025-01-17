"use strict";

const { Pinecone } = require("@pinecone-database/pinecone");
require('dotenv').config({ path: '.env.local' });

async function testPineconeConnection() {
  console.log("Testing Pinecone connection...");
  
  // Log environment variables
  console.log("Environment variables:");
  console.log("PINECONE_API_KEY exists:", !!process.env.PINECONE_API_KEY);
  console.log("PINECONE_ENVIRONMENT:", process.env.PINECONE_ENVIRONMENT);
  console.log("PINECONE_INDEX:", process.env.PINECONE_INDEX);
  
  try {
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });
    
    console.log("Pinecone client initialized");
    
    // List all indexes
    console.log("Listing all indexes...");
    const indexList = await pc.listIndexes();
    console.log("Available indexes:", JSON.stringify(indexList, null, 2));
    
    const indexName = process.env.PINECONE_INDEX;
    console.log(`\nChecking index: ${indexName}`);
    
    // Check if the index exists
    const indexExists = indexList.indexes?.some(idx => idx.name === indexName);
    if (!indexExists) {
      console.log(`Index '${indexName}' does not exist. Creating it...`);
      
      try {
        await pc.createIndex({
          name: indexName,
          dimension: 3072,
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          }
        });
        console.log("Index created successfully!");
      } catch (createError) {
        console.error("Error creating index:");
        console.error(createError);
        return;
      }
    } else {
      console.log("Index already exists");
    }
    
    const index = pc.index(indexName);
    
    console.log("Getting index description...");
    const description = await pc.describeIndex(indexName);
    console.log("Index description:", JSON.stringify(description, null, 2));
    
    // Test a simple upsert
    console.log("\nTesting vector upsert...");
    const testVector = Array(3072).fill(0).map(() => Math.random());
    await index.upsert([{
      id: 'test-vector',
      values: testVector,
      metadata: {
        text: 'This is a test vector'
      }
    }]);
    console.log("Vector upserted successfully!");
    
    console.log("Connection test successful!");
  } catch (error) {
    console.error("Error testing Pinecone connection:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    if (error.cause) {
      console.error("Error cause:", error.cause);
      if (error.cause.cause) {
        console.error("Root cause:", error.cause.cause);
      }
    }
  }
}

testPineconeConnection(); 