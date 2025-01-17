Below is a step-by-step, **very detailed** plan for implementing **@ mentions**, **notifications**, and **an AI "avatar" auto-response** in your Slack clone. We'll build from the ground up, introducing small checkpoints after each step to verify that each piece of functionality works as intended.

---
## **High-Level Overview of the Steps**

[x] 1. **Add a Mentions/Autocomplete UI** for typing `@username` in the chat input.
[ ] 2. **Implement Mentions Detection** in messages:
   - Parse the message text for `@username`.
   - Attach mention metadata to the message (e.g., which users are mentioned).
[ ] 3. **Create a Notification System** so that:
   - When a user is mentioned in a message, a new "notification" record is created for that user.
   - The user can see that notification in a "Notifications" panel or list.
[ ] 4. **Build a Jump-to-Message Mechanism**:
   - When a user clicks the notification, it redirects them to the **specific channel** or **conversation** where they were mentioned, scrolling to (or highlighting) the relevant message.
[ ] 5. **Train an AI Chatbot Representation** of each user:
   - (We'll store embeddings for each user's last ~10 messages or so.)
   - When user A mentions user B with a question, we:
     1. Gather user B's last 10 messages (or some context).
     2. Send them (plus the question) to GPT.
     3. Generate a response that "sounds" like user B.
     4. Post that AI response automatically into the channel or conversation.

We'll do multiple **checkpoints** to ensure everything is working:

[x] **Checkpoint A:** Basic mention UI for "@somebody" autocompletion.
[ ] **Checkpoint B:** Actual mention detection (who was mentioned) + storing it with the message.
[ ] **Checkpoint C:** Notification creation when a mention occurs + user sees it in their notifications.
[ ] **Checkpoint D:** Jump-to-message from the notification.
[ ] **Checkpoint E:** AI logic that auto-responds on behalf of the user being mentioned.

---

## **Step-by-Step Instructions**

### 1. **Create or Update the UI for Chat Input to Support "@ Mentions"**

[x] 1. **Modify `Editor.tsx` (or your main input component) to detect `@`**:
   - As soon as a user types `@`, open an autocomplete popover or menu.
   - Maintain a local state variable, e.g., `mentionQuery = ""`.
   - As the user continues typing after `@`, update `mentionQuery`.
     - Example: if the user typed "@ja", then `mentionQuery = "ja"`.

[x] 2. **In that popover, filter the `users` table**:
   - We do a **substring search** on `users.name` (the `name` field in the `users` table).
   - Return only users whose name includes `mentionQuery`.
   - You might use a new Convex query, e.g. `searchUsers` that does:
     ```ts
     .filter((q) => q.contains(q.field("name"), mentionQuery)) 
     ```
     or equivalently, a more manual substring search in your code.

[x] 3. **Autocomplete behavior**:
   - Once the user sees the list of filtered users, they can arrow down or click on the correct name (like "Jake").
   - When they select "Jake," the input text is replaced from `@ja` to `@Jake` plus a space, or however you want the UX.

[x] 4. **Checkpoint A**: **Verify** the popover shows up when typing `@`, that user list is correct, and that clicking on a user populates the chat input. **No message sending** logic is needed yet, just confirm we have a working UI.

---

### 2. **Detect and Store Mentions in the Message**

[ ] 1. **When the user sends the message** (the step in `Editor.tsx` or in your create message mutation in `messages.ts`):
   - Parse the final text body to find mentions of the form `@username`.
   - Example approach:
     - Use a regex like `/@([\w]+)/g` to detect mention tokens (assuming only alphanumeric in names).
     - For each mention found, see if there's a corresponding user in the `users` table with `name: thatString`.
     - Gather a list of `mentionedUserIds: Id<"users">[]`.

[ ] 2. **Update the `messages` table schema** (optional approach #1):
   - You could add a new field in `messages` called `mentionUserIds: v.array(v.id("users"))` to store the IDs of all mentioned users in that message.
   - Alternatively, you could store mention data in a separate `mentions` table. But easiest is to store an array on `messages`.

[ ] 3. **Add logic to your `createMessage` mutation** in `messages.ts`:
   - After constructing the `body` field, run the mention detection.
   - Then store `mentionUserIds` on the message record, e.g.:
     ```ts
     await ctx.db.insert("messages", {
       body: args.body,
       mentionUserIds,
       ...
     });
     ```
   - If no mentions are found, store an empty array.

[ ] 4. **Checkpoint B**: Verify that mentions are being detected in the final message text, and that your `messages` table has a `mentionUserIds` array that's correct.

---

### 3. **Create a Notifications System** to Alert Mentioned Users

[ ] 1. **Create a `notifications` table** in `convex/schema.ts`. For example:
   ```ts
   notifications: defineTable({
     userId: v.id("users"),     // The user who is receiving the notification
     messageId: v.id("messages"), // The message that triggered the notification
     channelId: v.optional(v.id("channels")), // channel or conversation?
     conversationId: v.optional(v.id("conversations")),
     isRead: v.boolean(),
     createdAt: v.number(),
   }),
   ```
   - Or something similar that references `workspaceId`, etc., depending on your needs. 
   - **isRead** indicates if the user has seen the notification.
   - **messageId** references the mention message that caused the notification.

[ ] 2. **In your `createMessage` mutation** (after you insert the message in the DB):
   - If `mentionUserIds` is not empty, loop over them:
     ```ts
     for (const userId of mentionUserIds) {
       await ctx.db.insert("notifications", {
         userId,
         messageId,
         channelId: args.channelId,
         conversationId: args.conversationId,
         isRead: false,
         createdAt: Date.now(),
       });
     }
     ```
   - This will create one notification record per mention.

[ ] 3. **Front-end fetch** (to display notifications):
   - Create a `getNotifications` query in e.g. `notifications.ts`:
     ```ts
     export const getForUser = query({
       args: {
         userId: v.id("users")
       },
       handler: async (ctx, args) => {
         return await ctx.db.query("notifications")
           .filter(q => q.eq(q.field("userId"), args.userId))
           .order("desc") // or however you want to order
           .collect();
       }
     });
     ```
   - In the front-end, call `useQuery(api.notifications.getForUser, {userId})`.
   - Render a notifications panel, or a button in the header that shows the number of unread notifications.

[ ] 4. **Checkpoint C**: 
   - Send a test message that mentions a user. 
   - Verify a notification record is created in your `notifications` table for that user.
   - In that user's front-end, ensure the notification is visible (unread count goes up, etc.).

---

### 4. **Click Notification to Jump to the Mentioned Message**

[ ] 1. **Decide on how to link** the user to the message. Some approaches:
   - Store `channelId` in the `notifications` record if it's in a channel.
   - If it's in a DM, store `conversationId`.
   - Also store the `workspaceId` if needed.

[ ] 2. **Create a Notification click handler** in e.g. your `Notifications.tsx` (or wherever you list notifications). 
   - If `notification.channelId` is set, do:
     ```js
     router.push(`/workspace/${workspaceId}/channel/${notification.channelId}?messageId=${notification.messageId}`)
     ```
     or something similar that indicates which message to scroll to.
   - If `notification.conversationId` is set, route them to the DM page.

[ ] 3. **Scrolling or highlighting** the message:
   - In your channel or conversation `page.tsx`, you can read `messageId` from query parameters. 
   - Then load messages until you find that ID, scroll, or highlight it. 
   - Implementation details vary, but one approach is to jump down after messages load.

[ ] 4. **Checkpoint D**: 
   - When you mention user B, user B sees a new notification. 
   - Clicking it navigates them to the correct channel or conversation and scrolls to the message.

---

### 5. **Implement the AI "Avatar" Auto-Response**

[ ] 1. **Store or Retrieve User's Last 10 Messages** (For AI Context)
   - When we detect `@Jake` in a message that also includes a question, we want to:
     - Identify which user is being "asked a question."
     - Retrieve that user's last ~10 messages from the `messages` table. 
       - For example:
         ```ts
         const last10 = await ctx.db.query("messages")
           .withIndex("by_member_id", q => q.eq("memberId", jakeMemberId))
           .order("desc")
           .take(10)
           .collect();
         ```
       - Convert them into text or JSON.

[ ] 2. **You might incorporate embeddings** from each user's messages (like you already do with Pinecone). 
   - For a simpler MVP, we can just do a direct text approach: feed the last 10 messages as is to GPT.

[ ] 3. **Call GPT** with Those 10 Messages + The User's New Prompt
   - Construct a system prompt: 
     - Summarize the user's style or personality, or do a direct approach: "You are Jake. Here are your last 10 Slack messages: …" 
   - Then add the user's new question as the user prompt. 
   - Wait for GPT to respond.

[ ] 4. **Post the Response on Behalf of the Mentioned User**
   - In your `createMessage` mutation, after inserting the mention notification code, check if:
     - The mention is specifically for "Jake," or we might do it for every mention if the user has an AI avatar enabled. 
     - If so, schedule an action or job (via e.g. `ctx.scheduler.runAfter(0, …)`) to fetch the last 10 messages, call GPT, then insert a new message in the same channel but with `memberId` belonging to that user's "AI avatar." 
     - Alternatively, you can do it synchronously in the same mutation. But be mindful of function run times.

[ ] 5. For the actual insertion:
   - We need a "Jake's AI avatar" `memberId`, or we can just re-use the real user's `memberId` if we want to appear like the user themselves posted it (which might be simpler for now).
   - Insert a new message:
     ```ts
     await ctx.db.insert("messages", {
       body: aiResponseBody,
       memberId: jakeMemberId,
       channelId: originalChannelId,
       workspaceId: originalWorkspaceId,
       // no mentionUserIds here, or we can do none
     });
     ```
   - This is what makes it look like Jake responded automatically.

[ ] 6. **Checkpoint E**:
   - Send a message like "@Jake what do you think about the new budget?" 
   - The system triggers GPT, returns a response, and posts it as Jake's message automatically.

---

## **Summary of Variables, Tables, and Columns Referenced**

- **`users` table**: 
  - Key column: `name` (string). We do substring search on this for the mention popover.
- **`messages` table**: 
  - Add a new field: `mentionUserIds: v.array(v.id("users"))`.
  - Existing fields: `body`, `channelId`, `conversationId`, etc.
- **(New) `notifications` table**: 
  - `userId: v.id("users")`
  - `messageId: v.id("messages")`
  - `channelId: v.optional(v.id("channels"))`
  - `conversationId: v.optional(v.id("conversations"))`
  - `isRead: v.boolean()`
  - `createdAt: v.number()`

## **Checkpoints Recap**

1. **Checkpoint A**: 
   - Press "@", see autocomplete popover listing user names, test substring search. 
2. **Checkpoint B**: 
   - On sending a message, mention detection is correct, `mentionUserIds` stored in `messages` table. 
3. **Checkpoint C**: 
   - Notifications are created for each mentioned user, displayed in UI. 
4. **Checkpoint D**: 
   - Clicking a notification jumps to the correct channel/conversation and highlights or scrolls to the message. 
5. **Checkpoint E**: 
   - Automatic AI response triggered by a mention, GPT fetches last 10 messages from that user, returns a response, and we confirm the new "auto-reply" message is posted in the channel.

---

### **Final Notes**

- **Testing**: 
  1. Start with local mentions that do not trigger AI. 
  2. Then once the notifications are stable, add the AI logic carefully (OpenAI calls can be slow).
- **Performance**: 
  - If searching for mentions or building context is expensive, you can optimize or embed messages. 
- **Security**: 
  - Make sure only authorized members can mention or see mentions in a workspace. 
- **Edge Cases**: 
  - A user might mention multiple people. Create multiple notifications. 
  - A user might mention themselves. Possibly skip or handle gracefully.

Following these steps with frequent checkpoints will ensure the system is robust, debug-friendly, and that you can confirm each new piece of functionality before moving on.