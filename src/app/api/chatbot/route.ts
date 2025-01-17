import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const PINECONE_INDEX = process.env.PINECONE_INDEX!;

export async function POST(req: Request) {
  try {
    console.log('1. Starting chatbot request processing...');
    
    const body = await req.json();
    const { userMessage } = body;
    console.log('2. Received user message:', userMessage);

    if (!userMessage) {
      console.error('3. Error: Missing user message');
      return NextResponse.json(
        { error: 'Missing userMessage' },
        { status: 400 }
      );
    }

    // Verify environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error('Missing OPENAI_API_KEY');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    if (!process.env.PINECONE_API_KEY) {
      console.error('Missing PINECONE_API_KEY');
      return NextResponse.json(
        { error: 'Pinecone API key not configured' },
        { status: 500 }
      );
    }

    if (!process.env.PINECONE_INDEX) {
      console.error('Missing PINECONE_INDEX');
      return NextResponse.json(
        { error: 'Pinecone index not configured' },
        { status: 500 }
      );
    }

    console.log('3. Creating embedding...');
    // 1. Create embedding for user query
    const embedRes = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: userMessage,
      encoding_format: 'float',
    });
    const queryVector = embedRes.data[0].embedding;
    console.log('4. Embedding created successfully, vector dimension:', queryVector.length);

    console.log('5. Querying Pinecone...');
    // 2. Query Pinecone for relevant context
    const index = pinecone.index(PINECONE_INDEX);
    const searchResult = await index.query({
      vector: queryVector,
      topK: 10,
      includeMetadata: true,
    });
    console.log('6. Pinecone query successful, matches:', searchResult.matches.length);

    // 3. Build context from search results
    const context = searchResult.matches
      .map(match => match.metadata?.text || '')
      .join('\n');
    console.log('7. Context built from matches');

    console.log('8. Calling OpenAI completion...');
    // 4. Create completion with context
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: `You are a helpful Slack-like assistant. Use the following context to inform your responses, but don't mention that you're using it unless specifically asked:\n\n${context}`
        },
        { role: 'user', content: userMessage }
      ]
    });
    console.log('9. OpenAI completion received');

    const answer = response.choices[0].message.content;
    console.log('10. Sending response back to client');
    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error('ChatBot API Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    
    // Return a more detailed error message
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        details: error.message,
        type: error.name
      },
      { status: 500 }
    );
  }
} 