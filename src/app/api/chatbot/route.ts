import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userMessage } = body;

    if (!userMessage) {
      return NextResponse.json(
        { error: 'Missing userMessage' },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful Slack-like assistant.' },
        { role: 'user', content: userMessage }
      ]
    });

    const answer = response.choices[0].message.content;
    return NextResponse.json({ answer });
  } catch (error) {
    console.error('ChatBot API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
} 