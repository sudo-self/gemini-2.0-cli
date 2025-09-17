#!/usr/bin/env node

import 'dotenv/config'; 
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

if (!API_KEY) {
  console.error("Error: GEMINI_API_KEY is not set. Please create a .env file.");
  process.exit(1);
}

console.log("Welcome to Gemini CLI Chatbot!");
console.log("Type 'exit' to quit.\n");

async function sendToGemini(message) {
  try {
    const res = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();

    if (data.candidates && data.candidates[0].content.parts[0].text) {
      return {
        text: data.candidates[0].content.parts[0].text,
        tokens: data.usageMetadata ? data.usageMetadata.totalTokenCount : 'N/A'
      };
    } else {
      throw new Error('Unexpected response format');
    }
  } catch (err) {
    return { text: `Error: ${err.message}`, tokens: 0 };
  }
}

async function main() {
  while (true) {
    const message = await rl.question('You> ');
    if (message.toLowerCase() === 'exit') break;

    console.log('Gemini> ...thinking...\n');
    const response = await sendToGemini(message);
    console.log(`Gemini> ${response.text}`);
    console.log(`Tokens used: ${response.tokens}\n`);
  }

  rl.close();
  console.log('Goodbye!');
}

main();




