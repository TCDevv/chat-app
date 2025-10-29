# Test Cases for Web Chat Application

## 1. Chat List Functionality

### TC-001: Display Chat List
**Objective**: Verify that the chat list displays all available chats
**Preconditions**: User has access to the application with mock data loaded
**Steps**:
1. Open the application
2. Observe the left sidebar (chat list)
**Expected Results**:
- All chats are visible in the left sidebar
- Each chat shows name, avatar, last message preview, and timestamp
- Unread count badge is displayed for chats with unread messages

### TC-002: Select a Chat
**Objective**: Verify that clicking on a chat loads its messages
**Preconditions**: Application is open with chats visible
**Steps**:
1. Click on any chat in the chat list
**Expected Results**:
- Selected chat is highlighted
- Messages for the selected chat are displayed in the main area
- Chat name appears in the message area header

### TC-003: Unread Count Update
**Objective**: Verify that unread count updates when a chat is selected
**Preconditions**: A chat has unread messages
**Steps**:
1. Note the unread count for a chat
2. Click on that chat
**Expected Results**:
- Unread count badge is removed or shows 0
- Chat is marked as read

## 2. Message Display and Interaction

### TC-004: Send a Message
**Objective**: Verify that users can send messages
**Preconditions**: A chat is selected
**Steps**:
1. Type a message in the input field
2. Click the "Send" button
**Expected Results**:
- Message appears in the message area
- Message is aligned to the right (own message)
- Message has "sent" status
- Input field is cleared
- Message appears in the chat list preview

### TC-005: Send Message with Enter Key
**Objective**: Verify that pressing Enter sends the message
**Preconditions**: A chat is selected
**Steps**:
1. Type a message in the input field
2. Press Enter key
**Expected Results**:
- Message is sent (same as clicking Send button)
- Input field is cleared

### TC-006: Prevent Empty Message Send
**Objective**: Verify that empty or whitespace-only messages cannot be sent
**Preconditions**: A chat is selected
**Steps**:
1. Try to click Send without typing anything
2. Type only spaces and try to send
**Expected Results**:
- Send button is disabled when input is empty
- Message is not sent for whitespace-only input

### TC-007: Display Message Metadata
**Objective**: Verify that messages display correct metadata
**Preconditions**: A chat with messages is selected
**Steps**:
1. Observe the messages in the message area
**Expected Results**:
- Each message shows timestamp
- Own messages show delivery status (sent/delivered/read)
- Received messages show sender name
- Messages are formatted with proper styling

## 3. Large Message Load Performance

### TC-008: Load 1000 Messages
**Objective**: Verify that the application can handle loading 1000 messages
**Preconditions**: A chat is selected
**Steps**:
1. Click the "Load 1000 Messages" button
2. Observe the message area
**Expected Results**:
- Application loads 1000 messages without crashing
- Scrolling is smooth and performant
- Virtual scrolling is implemented (only visible messages are rendered)
- UI remains responsive

### TC-009: Virtual Scrolling Performance
**Objective**: Verify that virtual scrolling works correctly with large message sets
**Preconditions**: A chat with 1000 messages is loaded
**Steps**:
1. Scroll to the top of the message list
2. Scroll to the bottom
3. Scroll to the middle
**Expected Results**:
- Scrolling is smooth without lag
- Messages load correctly at all scroll positions
- No visual glitches or blank spaces

## 4. Web Worker Integration

### TC-010: Simulate Worker Messages
**Objective**: Verify that messages received from Web Worker are displayed
**Preconditions**: A chat is selected
**Steps**:
1. Click the "Simulate Worker Messages" button
2. Observe the message area and chat list
**Expected Results**:
- New messages appear in the message area
- New messages appear in the chat list preview
- Messages are processed without blocking the UI
- Application remains responsive during message processing

### TC-011: Web Worker Message Processing
**Objective**: Verify that Web Worker can process large batches of messages
**Preconditions**: Application is running
**Steps**:
1. Trigger bulk message processing via Web Worker
2. Monitor application performance
**Expected Results**:
- Worker processes messages in the background
- Main thread remains responsive
- Processed messages are correctly added to the message list

## 5. PostMessage API Integration

### TC-012: Receive Message via PostMessage
**Objective**: Verify that external messages via postMessage API are received
**Preconditions**: Application is open
**Steps**:
1. Send a message using window.postMessage with proper format
2. Observe the application
**Expected Results**:
- Message is received and displayed in the correct chat
- Message appears in both message area (if chat is selected) and chat list
- Message has correct metadata

### TC-013: PostMessage Message Format Validation
**Objective**: Verify that only properly formatted postMessages are processed
**Preconditions**: Application is open
**Steps**:
1. Send postMessage with incorrect format
2. Send postMessage with correct format
**Expected Results**:
- Invalid messages are ignored
- Valid messages are processed correctly
- No errors are thrown for invalid messages

## 6. Scroll to Message by ID

### TC-014: Scroll to Message via URL Parameter
**Objective**: Verify that providing a messageId in URL scrolls to that message
**Preconditions**: A chat with messages is loaded
**Steps**:
1. Open application with URL parameter ?messageId=msg_123
2. Observe the message area
**Expected Results**:
- Application automatically scrolls to the message with ID "msg_123"
- Message is highlighted/focused
- Smooth scroll animation is applied

### TC-015: Invalid Message ID in URL
**Objective**: Verify behavior when URL contains non-existent messageId
**Preconditions**: Application is open
**Steps**:
1. Open application with URL parameter ?messageId=nonexistent
**Expected Results**:
- Application loads normally
- No errors are thrown
- Message list shows normally without scroll action

## 7. Local Storage Persistence

### TC-016: Data Persistence Across Sessions
**Objective**: Verify that messages and chats persist in localStorage
**Preconditions**: Application has been used with messages sent
**Steps**:
1. Send several messages
2. Refresh the browser
3. Observe the application
**Expected Results**:
- All previous messages are still visible
- Chat list maintains the same state
- Last message previews are correct

### TC-017: Initialize Mock Data on First Load
**Objective**: Verify that mock data is initialized on first load
**Preconditions**: Clean browser with no localStorage data
**Steps**:
1. Clear localStorage
2. Open the application
**Expected Results**:
- Mock chats are created
- Each chat has initial messages
- Application is functional with mock data

## 8. Responsive Design

### TC-018: Mobile View
**Objective**: Verify that the application is responsive on mobile devices
**Preconditions**: Application is open
**Steps**:
1. Resize browser to mobile dimensions (< 768px)
2. Interact with the application
**Expected Results**:
- Layout adapts to mobile view
- Chat list and message area are accessible
- All features work on mobile view

### TC-019: Tablet View
**Objective**: Verify that the application works on tablet dimensions
**Preconditions**: Application is open
**Steps**:
1. Resize browser to tablet dimensions (768px - 992px)
**Expected Results**:
- Layout is optimized for tablet
- All features are accessible and functional

## 9. Error Handling

### TC-020: LocalStorage Full Error
**Objective**: Verify graceful handling when localStorage is full
**Preconditions**: Application is running
**Steps**:
1. Fill localStorage to capacity
2. Try to send a new message
**Expected Results**:
- Error is caught and logged
- Application doesn't crash
- User is informed (if error handling includes user notification)

### TC-021: Worker Error Handling
**Objective**: Verify that worker errors don't crash the main application
**Preconditions**: Application is running
**Steps**:
1. Trigger an error in the Web Worker
**Expected Results**:
- Error is caught
- Application continues to function
- Error is logged for debugging

## 10. UI/UX Elements

### TC-022: Message Time Formatting
**Objective**: Verify that message timestamps are formatted correctly
**Preconditions**: Messages with various timestamps exist
**Steps**:
1. Observe message timestamps
**Expected Results**:
- Today's messages show time (e.g., "10:30 AM")
- Older messages show date (e.g., "Jan 15")
- Format is consistent and readable

### TC-023: Avatar Display
**Objective**: Verify that avatars are displayed correctly
**Preconditions**: Chat list is visible
**Steps**:
1. Observe chat avatars
**Expected Results**:
- Avatars are circular
- If no image, initials are shown in colored circle
- Images load correctly

### TC-024: Message Alignment
**Objective**: Verify that own and received messages are aligned correctly
**Preconditions**: Chat with both own and received messages is open
**Steps**:
1. Observe message alignment
**Expected Results**:
- Own messages are right-aligned with green background
- Received messages are left-aligned with white background
- Proper spacing between messages
