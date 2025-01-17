STEP 1: **Implement & Test the Chat Bubble (Front-End UI)**

1. **Create or Update the `ChatWidget` Component**  
   - **Purpose**: This component will display a chat bubble icon in the bottom-right corner of the screen.  
   - **File**: `src/components/ChatWidget.tsx` (or wherever your UI component is).  
   - **Instructions**:  
     - Ensure the component has `position: fixed; bottom: 20px; right: 20px; z-index: 9999;` (or equivalent styling) so that the bubble is always visible.  
     - Add a `data-testid="chat-bubble"` attribute to the bubble icon.  
     - On click, it should toggle a small chat window (a simple `<div>` or `<section>`) that’s also fixed, showing a text input field and a “Send” button.  
     - The chat window can be hidden by default (display: none or a boolean state set to `false`). Clicking the bubble toggles it to visible.  

2. **Create a New Test**  
   - **File**: `__tests__/ChatWidget.test.tsx` (or similar).  
   - **Instructions**:  
     - Import `render` and `screen` from `@testing-library/react`.  
     - Render `<ChatWidget />`.  
     - Use `screen.getByTestId('chat-bubble')` to check if the bubble exists in the DOM.  
     - Optionally, check the inline styles or CSS classes if needed:  
       ```ts
       const bubble = screen.getByTestId('chat-bubble');
       expect(bubble).toHaveStyle('position: fixed');
       // etc.
       ```  

3. **Environment / Variables**  
   - **No special environment keys** are needed for just rendering the chat bubble in the front-end UI.  

4. **CheckPoint A**  
   - Stop here and run your test suite (`npm run test` or `yarn test`).  
   - Confirm the test passes and you see no breakage in existing tests.

--------------------------------------------------------------------------------
STEP 2: **Implement & Test the “Send” Button Click**

1. **Add a “Send” Button**  
   - **File**: `src/components/ChatWidget.tsx`  
   - **Instructions**:  
     - Inside the opened chat window (the `<div>` that toggles), place a `button` element with `data-testid="send-button"`.  
     - Next to it, have an `<input type="text" data-testid="chat-input" />` or use a controlled state if you prefer React best practices.  

2. **Add OnClick Handler**  
   - **In the same `ChatWidget.tsx`**:  
     - Create a function, for example:  
       ```ts
       const handleSend = async () => {
         // This function will eventually call the back-end
         // For now, just console.log("Send button clicked");
       };
       ```  
     - Attach `onClick={handleSend}` to the “Send” button.  

3. **Add a New Test in `ChatWidget.test.tsx`**  
   - **Instructions**:  
     - Use `render(<ChatWidget />)` again.  
     - Grab the input and button via `screen.getByTestId("chat-input")` and `screen.getByTestId("send-button")`.  
     - Use `fireEvent.change` or `userEvent.type` to type something into the input (e.g. “Hello, world”).  
     - Then `fireEvent.click(sendButton)`.  
     - Confirm that your `handleSend` function was called (perhaps via a mock or spy).  
       ```ts
       expect(mockHandleSend).toHaveBeenCalledTimes(1);
       ```  
     - (If you do not mock or spy, at least ensure no errors are thrown when clicking the button.)  

4. **CheckPoint B**  
   - Run `npm run test` again.  
   - Confirm the new test passes.  
   - Verify that the bubble UI test from Step 1 is also still green.

--------------------------------------------------------------------------------
STEP 3: **Connect the “Send” Button to the Next.js API Route (OpenAI)**

1. **Set Up Back-End Route**  
   - **File**: `src/pages/api/chatbot.ts` or similar Next.js route.  
   - **Instructions**:  
     - This route should expect a POST request with a JSON body like:  
       ```json
       { "userMessage": "Hello, how are you?" }
       ```  
     - It should read `process.env.OPENAI_API_KEY` to call the OpenAI API.  
     - The request to OpenAI might look like this (pseudocode):
       ```ts
       import { Configuration, OpenAIApi } from 'openai';

       const config = new Configuration({
         apiKey: process.env.OPENAI_API_KEY,
       });
       const openai = new OpenAIApi(config);

       ...

       export default async function handler(req, res) {
         if (req.method !== 'POST') {
           return res.status(405).json({ error: 'Method not allowed' });
         }

         const { userMessage } = req.body;
         if (!userMessage) {
           return res.status(400).json({ error: 'Missing userMessage' });
         }

         // call openai
         const response = await openai.createChatCompletion({
           model: 'gpt-3.5-turbo', // or 'gpt-4'
           messages: [
             { role: 'system', content: 'You are a helpful Slack-like assistant.' },
             { role: 'user', content: userMessage }
           ]
         });

         const answer = response.data.choices[0].message.content;
         return res.status(200).json({ answer });
       }
       ```  

2. **Create or Update `handleSend`** in `ChatWidget.tsx`  
   - **Instructions**:  
     - We need to fetch the `/api/chatbot` endpoint with the message text.  
     - Example (using `fetch`):
       ```ts
       const handleSend = async () => {
         const text = inputValue; // from state
         const res = await fetch('/api/chatbot', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ userMessage: text })
         });
         const data = await res.json(); 
         // data.answer should contain the model's response
         setChatHistory((prev) => [...prev, { role: 'assistant', content: data.answer }]);
       };
       ```  
     - In the snippet above, `setChatHistory` is a React state setter that appends the new message from the AI to the UI chat.  

3. **Environment Variables**  
   - **`process.env.OPENAI_API_KEY`** must be set in your `.env.local` (or whichever environment is used).  
   - Make sure Next.js can read it in the API route.  

4. **Test the Connection**  
   - **Local Test**:  
     - Run `npm run dev` or `yarn dev`.  
     - In the browser, open the chat widget.  
     - Type something in the text input, click “Send”.  
     - Check your Next.js console logs (and browser DevTools console) to confirm the 200 response.  
     - The UI should display the model’s answer.  

5. **CheckPoint C**  
   - Confirm that the “Send” button now triggers an actual call to your back-end Next.js route, which in turn calls the OpenAI API.  
   - Ensure no console errors.  
   - Run automated tests if you wrote integration tests for this step.

--------------------------------------------------------------------------------
STEP 4: **Pinecone Retrieval: Storing Slack Messages & Querying**  
(This step is very specific to your MVP if you want to integrate real Slack messages.)

1. **Set Up Pinecone**  
   - **Variables**:  
     - `process.env.PINECONE_API_KEY` — your Pinecone API key.  
     - `process.env.PINECONE_ENVIRONMENT` or region.  
     - `process.env.PINECONE_INDEX` — name of your index.  
   - **Back-End**: Possibly a separate route or server action to embed Slack messages and upsert them into Pinecone.  

2. **Embed Slack Messages on Creation**  
   - **File**: could be in a function `insertMessageToPinecone.ts`.  
   - **Instructions**:  
     - When a new Slack-like message is created in your DB (Convex/wherever), call the OpenAI embeddings endpoint to get a vector.  
     - Upsert that vector into Pinecone using the official Pinecone client library.  
     - Example (pseudocode):
       ```ts
       import { PineconeClient } from '@pinecone-database/pinecone';

       const pinecone = new PineconeClient();
       await pinecone.init({
         environment: process.env.PINECONE_ENVIRONMENT,
         apiKey: process.env.PINECONE_API_KEY,
       });

       const index = pinecone.Index(process.env.PINECONE_INDEX);

       ...

       await index.upsert({
         vectors: [
           {
             id: messageIdString,
             values: embeddingArray,
             metadata: { text: messageBody, channelId, workspaceId, etc. }
           }
         ]
       });
       ```  

3. **Modify the Next.js Route** to Do Retrieval**  
   - **File**: `src/pages/api/chatbot.ts`, again.  
   - **Instructions**:  
     - Instead of passing user query directly to OpenAI, first embed the user query with the embeddings endpoint.  
       ```ts
       const embedRes = await openai.createEmbedding({
         model: 'text-embedding-ada-002',
         input: userMessage
       });
       const queryVector = embedRes.data.data[0].embedding; 
       ```  
     - Then query Pinecone with that vector to find top relevant Slack messages.  
       ```ts
       const searchResult = await index.query({
         vector: queryVector,
         topK: 5,
         includeMetadata: true
       });
       ```  
     - Extract the relevant chunks from `searchResult.matches` and build a prompt for GPT-4 (or GPT-3.5) that includes those Slack messages as context.  

4. **Return Summarized Answer**  
   - **Instructions**:  
     - Something like:
       ```ts
       const contextMessages = searchResult.matches.map(m => m.metadata.text).join('\n\n');
       // Then feed into openai.createChatCompletion:
       const response = await openai.createChatCompletion({
         model: 'gpt-4',
         messages: [
           { role: 'system', content: 'You are Slack Chat Summarizer. Summarize these messages below and answer the user question.' },
           { role: 'assistant', content: `Here are relevant Slack messages:\n\n${contextMessages}` },
           { role: 'user', content: userMessage }
         ]
       });
       ```  

5. **UI Response**  
   - **Front-End**: The UI now gets a more “context aware” response.  
   - Example final answer: “Based on Slack messages #A, #B, #C, here is the summary... [answer text].”  

6. **CheckPoint D**  
   - Start the app, type a question that’s relevant to the Slack messages you inserted.  
   - Confirm the summarization includes data from those messages.  
   - Confirm no 500 errors, no console errors.  

--------------------------------------------------------------------------------
STEP 5: **E2E Integration Test** (Optional, but recommended)

1. **Create an Integration/E2E Test**  
   - **File**: `__tests__/E2EChat.test.ts` (for example).  
   - **Instructions**:  
     - Use `msw` or `supertest` to call the Next.js route with a sample payload.  
     - Mock out Pinecone if you don’t want to do live calls. Alternatively, set up a test Pinecone index with a few known embeddings.  
     - Confirm the final JSON shape is `{ answer: "some text" }`.  

2. **Run All Tests**  
   - **Commands**:  
     - `npm run test` or `yarn test` for unit tests.  
     - `npm run test:e2e` if you have a separate e2e script or use something like Cypress.  

3. **Final Confirmation**  
   - If all tests are green, your pipeline is fully validated:  
     - The chat bubble shows up,  
     - The “Send” button triggers the route,  
     - The route calls Pinecone (optional) + OpenAI,  
     - The user sees a summarized answer in the UI.  

--------------------------------------------------------------------------------
STOP POINTS / CHECKPOINTS (Recap)

1. **CheckPoint A**: Basic chat bubble UI.  
2. **CheckPoint B**: “Send” button test.  
3. **CheckPoint C**: Next.js route integrated with OpenAI.  
4. **CheckPoint D**: Pinecone retrieval logic.  
5. **(Optional)** E2E integration test is fully passing.

At each checkpoint, you must confirm the partial changes do not break anything else and that the newly added tests pass. Only after confirming do you proceed to the next step.

This ensures we maintain minimal, carefully contained changes at each stage while thoroughly testing each new feature or improvement.
