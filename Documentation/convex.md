# Convex Database Documentation

## Database Tables
Our Slack clone application uses the following tables in the Convex database:

### Authentication Tables
- `authAccounts`: Stores user account information
- `authRateLimits`: Manages rate limiting for authentication
- `authRefreshTokens`: Stores refresh tokens for session management
- `authSessions`: Manages active user sessions
- `authVerificationCodes`: Stores verification codes for authentication
- `authVerifiers`: Stores authentication verifiers

### Application Tables
- `channels`: Stores channel information
- `conversations`: Manages direct messages and conversations
- `members`: Stores channel/workspace membership information
- `messages`: Stores all messages
- `reactions`: Stores message reactions
- `users`: Stores user profiles and settings
- `workspaces`: Stores workspace information

## Table Details

### Users Table
The users table stores basic user information with the following structure:

Fields:
- `_id`: Unique identifier (string)
- `_creationTime`: Timestamp of user creation
- `email`: User's email address
- `image`: User's profile image (optional)
- `name`: User's display name (optional)

Sample Data:
```
_id                                | _creationTime      | email                       | image | name       
-----------------------------------|--------------------|-----------------------------|----|------------
"kh7egr3ewz2ajzbvctp0fcz2y178jrdq" | 1737073929336.2363 | "heyyy@gmail.com"           |    |            
"kh7azbghgny47nex7vkdjzxs2578jty6" | 1737073477278.7227 | "reeceharding122@gmail.com" |    |            
"kh763hz017xg74a8fstb6k7vn578jfm1" | 1737073301743.7124 | "newreeceharding@gmail.com" |    |            
```

### Messages Table
The messages table stores all messages sent in channels and conversations:

Fields:
- `_id`: Unique identifier (string)
- `_creationTime`: Timestamp of message creation
- `body`: Message content in JSON format with rich text support
- `channelId`: ID of the channel (if message is in a channel)
- `conversationId`: ID of the conversation (if message is in a DM)
- `image`: Optional image attachment
- `memberId`: ID of the member who sent the message
- `parentMessageId`: ID of the parent message (for threaded replies)
- `updatedAt`: Timestamp of last update
- `workspaceId`: ID of the workspace the message belongs to

Sample Data:
```
_id                                | _creationTime      | body                                              | channelId                           | conversationId
-----------------------------------|--------------------|---------------------------------------------------|-------------------------------------|---------------
"k975m021p3gxtp7bbktx2azyp578j1ty" | 1737073952545.6323 | {"ops":[{"insert":"hey all!\n"}]}                | "jx781d1hnbgc6k81g2s7dyw98n78jb9n" | 
"k973bww7tsgrzfy08y5yxspmqx78htvy" | 1737071269119.156  | {"ops":[{"insert":"hey\n"}]}                     | "jx7298vac1dtzmbssk0gzqt3s978ga33" |
```

### Channels Table
The channels table stores information about all channels in workspaces:

Fields:
- `_id`: Unique identifier (string)
- `_creationTime`: Timestamp of channel creation
- `name`: Channel name
- `workspaceId`: ID of the workspace the channel belongs to

Sample Data:
```
_id                                | _creationTime      | name             | workspaceId
-----------------------------------|--------------------|------------------|------------------------------------
"jx781d1hnbgc6k81g2s7dyw98n78jb9n" | 1737073947937.0173 | "anotha-channel" | "kn7e4ch69ykx6cqshc16xtak5x78jnkw"
"jx7c6dy4w0zgqn5qfd43ahx7g578k5h6" | 1737073933972.6868 | "general"        | "kn7e4ch69ykx6cqshc16xtak5x78jnkw"
```

### Workspaces Table
The workspaces table stores information about all workspaces:

Fields:
- `_id`: Unique identifier (string)
- `_creationTime`: Timestamp of workspace creation
- `joinCode`: Unique code for joining the workspace
- `name`: Workspace name
- `userId`: ID of the workspace owner/creator

Sample Data:
```
_id                                | _creationTime      | joinCode  | name                  | userId
-----------------------------------|--------------------|-----------|----------------------|------------------------------------
"kn7e4ch69ykx6cqshc16xtak5x78jnkw" | 1737073933972.6863 | "u6ycpt"  | "heyyy@gmail.com"     | "kh7egr3ewz2ajzbvctp0fcz2y178jrdq"
"kn736temycer1y90415jhyt49978kxsb" | 1737073481103.7036 | "u83w4j"  | "222"                 | "kh7azbghgny47nex7vkdjzxs2578jty6"
```

### Members Table
The members table stores workspace membership information:

Fields:
- `_id`: Unique identifier (string)
- `_creationTime`: Timestamp of membership creation
- `role`: Member's role in the workspace (e.g., "admin")
- `userId`: ID of the user
- `workspaceId`: ID of the workspace

Sample Data:
```
_id                                | _creationTime      | role    | userId                             | workspaceId
-----------------------------------|--------------------|---------|------------------------------------|---------------------------------
"k57ezgk22cqch339pfwec1cqmh78k864" | 1737073933972.6865 | "admin" | "kh7egr3ewz2ajzbvctp0fcz2y178jrdq" | "kn7e4ch69ykx6cqshc16xtak5x78jnkw"
"k575eqwak83h1h6veyry87nahh78kbmw" | 1737073481103.7039 | "admin" | "kh7azbghgny47nex7vkdjzxs2578jty6" | "kn736temycer1y90415jhyt49978kxsb"
```

### Conversations Table
The conversations table stores direct message conversations between workspace members:

Fields:
- `_id`: Unique identifier (string)
- `_creationTime`: Timestamp of conversation creation
- `memberOneId`: ID of the first member in the conversation
- `memberTwoId`: ID of the second member in the conversation
- `workspaceId`: ID of the workspace where the conversation takes place

Sample Data:
```
_id                                | _creationTime      | memberOneId                         | memberTwoId                         | workspaceId
-----------------------------------|--------------------|-------------------------------------|-------------------------------------|------------------------------------
"k176e9tfgrjpx371gtte53f52s78hgxh" | 1737052674180.9995 | "k577xcay5a6qn0v5334d6qqjpd78g6fz" | "k577xcay5a6qn0v5334d6qqjpd78g6fz" | "kn75247h9yftbz55emxngmyqt578gjm0"
"k1715gtjgk0akx70jv8b38zr6x78f353" | 1736979721911.6172 | "k5776zzze7mm3cr00g2a9p8txn78f1wr" | "k5776zzze7mm3cr00g2a9p8txn78f1wr" | "kn78dyswwfmcmctnpdc3at84xs78edfd"
```

### Reactions Table
The reactions table stores emoji reactions to messages:

Fields:
- `_id`: Unique identifier (string)
- `_creationTime`: Timestamp of reaction creation
- `memberId`: ID of the member who reacted
- `messageId`: ID of the message that was reacted to
- `value`: The emoji reaction value
- `workspaceId`: ID of the workspace where the reaction occurred

Sample Data:
```
_id                                | _creationTime      | memberId                           | messageId                           | value | workspaceId
-----------------------------------|--------------------|------------------------------------|------------------------------------|-------|------------------------------------
"kd72has07eerp503jjsywbcmk578kf6a" | 1737073956932.8237 | "k57ezgk22cqch339pfwec1cqmh78k864" | "k975m021p3gxtp7bbktx2azyp578j1ty" | "😇"  | "kn7e4ch69ykx6cqshc16xtak5x78jnkw"
"kd7fpchyabs7x89er4wz6dxjwx78gy77" | 1737070832549.5574 | "k57b309e2mfaw2chxs0r849hg978g3wb" | "k9713k1vskapctv998w262w60178hszp" | "🫠"  | "kn74ytee3nwnjrq11ga4kg12en78gedn"
```

### Auth Accounts Table
The authAccounts table stores authentication information for users:

Fields:
- `_id`: Unique identifier (string)
- `_creationTime`: Timestamp of account creation
- `provider`: Authentication provider (e.g., "password", "google")
- `providerAccountId`: User identifier in the provider's system (usually email for password auth)
- `secret`: Hashed password or other authentication secret
- `userId`: ID of the associated user

Sample Data:
```
_id                                | _creationTime      | provider   | providerAccountId        | userId
-----------------------------------|--------------------|------------|-------------------------|------------------------------------
"j57csmabf2c0ct9qqbh9dsy9e978ka50" | 1737073929336.2366 | "password" | "heyyy@gmail.com"        | "kh7egr3ewz2ajzbvctp0fcz2y178jrdq"
"j570h1c0qmt5m7hacq8jvd5kzh78e6mc" | 1736977104006.2126 | "google"   | "105385674953487670529" | "kh7563nd2nhtmj62kzyfxdcy6d78e66g"
```

### Auth Sessions Table
The authSessions table stores active user sessions:

Fields:
- `_id`: Unique identifier (string)
- `_creationTime`: Timestamp of session creation
- `expirationTime`: Timestamp when the session expires
- `userId`: ID of the user the session belongs to

Sample Data:
```
_id                                | _creationTime      | expirationTime | userId
-----------------------------------|--------------------|----------------|-----------------------------------
"jh72hkgvy60vt4a2bgwq4xdqkh78j6sz" | 1737073929581.0232 | 1739665929581  | "kh7egr3ewz2ajzbvctp0fcz2y178jrdq"
"jh75wfvj00v4rnnkkbhh0zxqs178kqgf" | 1737073477505.426  | 1739665477507  | "kh7azbghgny47nex7vkdjzxs2578jty6"
```

### Auth Refresh Tokens Table
The authRefreshTokens table stores refresh tokens for session management:

Fields:
- `_id`: Unique identifier (string)
- `_creationTime`: Timestamp of token creation
- `expirationTime`: Timestamp when the refresh token expires
- `sessionId`: ID of the associated session

Sample Data:
```
_id                                | _creationTime      | expirationTime | sessionId
-----------------------------------|--------------------|----------------|-----------------------------------
"jd76wr939f7j71m1b228jex79h78k094" | 1737073930770.6277 | 1739665930770  | "jh72hkgvy60vt4a2bgwq4xdqkh78j6sz"
"jd78cs3bzhebfjx74fmbsdzaj178k1j8" | 1737073478533.2322 | 1739665478533  | "jh75wfvj00v4rnnkkbhh0zxqs178kqgf"
```

### Auth Rate Limits Table
The authRateLimits table manages rate limiting for authentication operations:

Fields:
- `_id`: Unique identifier (string)
- `_creationTime`: Timestamp of rate limit creation
- `identifier`: The identifier being rate limited (e.g., IP address, email)
- `operation`: The operation being rate limited (e.g., login attempts)
- `count`: Number of attempts
- `expirationTime`: Timestamp when the rate limit expires

Note: Currently, there are no entries in the authRateLimits table.

### Auth Verification Codes Table
The authVerificationCodes table stores verification codes for authentication processes:

Fields:
- `_id`: Unique identifier (string)
- `_creationTime`: Timestamp of verification code creation
- `accountId`: ID of the auth account being verified
- `code`: The verification code (hashed)
- `expirationTime`: Timestamp when the verification code expires
- `provider`: Authentication provider (e.g., "google")
- `verifier`: ID of the associated verifier

Sample Data:
```
_id                                | _creationTime      | accountId                           | code                                                                    | expirationTime | provider | verifier
-----------------------------------|--------------------|-------------------------------------|-------------------------------------------------------------------------|---------------|----------|------------------------------------
"jn7b1wzg206tn7gjedzz6kcqj178e6r0" | 1736977691448.5317 | "j570h1c0qmt5m7hacq8jvd5kzh78e6mc" | "70ee976ff211baaba8f0da82530f630f31577e572909bcb2ba3ad3d49819f4c8" | 1736977811448 | "google" | "js763xkd701ntzc6q10az8bbfh78ehxz"
```

### Auth Verifiers Table
The authVerifiers table stores cryptographic signatures for authentication verification:

Fields:
- `_id`: Unique identifier (string)
- `_creationTime`: Timestamp of verifier creation
- `signature`: Cryptographic signature for verification

Sample Data:
```
_id                                | _creationTime      | signature                                    
-----------------------------------|--------------------|----------------------------------------------
"js7fwbggvgdj7vnfj7n42xr71d78fwdq" | 1736977432100.6497 | "2Pc0OJT5Gw35kdQtC4rk0CD2OOhWow-hV095jIo7qRM"
"js72qzxjqw2jm7hskbh18xdzth78ewjv" | 1736976117413.628  | "mGpn2M4gHdf3Qfnpjqnl3GY_v9Ahf-07sAH5PYXjyho"
```

## Database Relationships

The database tables are interconnected through various relationships:

1. User Authentication Flow:
   - `users` ↔ `authAccounts`: One-to-one relationship through `userId`
   - `authAccounts` ↔ `authSessions`: One-to-many through `userId`
   - `authSessions` ↔ `authRefreshTokens`: One-to-many through `sessionId`
   - `authAccounts` ↔ `authVerificationCodes`: One-to-many through `accountId`

2. Workspace Membership:
   - `users` ↔ `members`: One-to-many through `userId`
   - `workspaces` ↔ `members`: One-to-many through `workspaceId`
   - `workspaces` ↔ `channels`: One-to-many through `workspaceId`

3. Messaging:
   - `members` ↔ `messages`: One-to-many through `memberId`
   - `channels` ↔ `messages`: One-to-many through `channelId`
   - `conversations` ↔ `messages`: One-to-many through `conversationId`
   - `messages` ↔ `reactions`: One-to-many through `messageId`

4. Direct Messaging:
   - `members` ↔ `conversations`: Many-to-many through `memberOneId` and `memberTwoId`
   - `workspaces` ↔ `conversations`: One-to-many through `workspaceId`