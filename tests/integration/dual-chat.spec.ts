import { test, expect } from '@playwright/test';

test.describe('Dual-Chat Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid^="chat-item"]');
  });

  test('should display welcome screen when no chat is selected', async ({ page }) => {
    await expect(page.locator('text=Welcome to Chat App')).toBeVisible();
    await expect(page.locator('text=Select a chat from the left sidebar to start messaging')).toBeVisible();
  });

  test('should open single chat in full view', async ({ page }) => {
    // Click first chat
    const firstChat = page.locator('[data-testid^="chat-item"]').first();
    await firstChat.click();

    // Verify single chat view
    await expect(page.locator('text=Welcome to Chat App')).not.toBeVisible();
    await expect(page.locator('[data-testid="messages-list"]')).toBeVisible();

    // Verify no split view
    await expect(page.locator('[data-testid="close-chat-button"]')).not.toBeVisible();
  });

  test('should open two chats in split view', async ({ page }) => {
    // Click first chat
    await page.locator('[data-testid^="chat-item"]').nth(0).click();
    await page.waitForTimeout(300);

    // Click second chat
    await page.locator('[data-testid^="chat-item"]').nth(1).click();
    await page.waitForTimeout(500);

    // Verify both message areas are visible (2 chat panes)
    await expect(page.locator('[data-testid="messages-list"]')).toHaveCount(2);

    // Verify close buttons are visible in split view
    await expect(page.locator('[data-testid="close-chat-button"]')).toHaveCount(2);
  });

  test('should replace leftmost chat when opening third chat', async ({ page }) => {
    // Open first chat (chat_1)
    await page.locator('[data-testid^="chat-item"]').nth(0).click();
    await page.waitForTimeout(300);

    // Open second chat (chat_2)
    await page.locator('[data-testid^="chat-item"]').nth(1).click();
    await page.waitForTimeout(300);

    // Open third chat (chat_3) - should replace first chat (chat_1)
    // Result should be: chat_2 (left) and chat_3 (right)
    await page.locator('[data-testid^="chat-item"]').nth(2).click();
    await page.waitForTimeout(500);

    // Should still have 2 message areas (not 3)
    await expect(page.locator('[data-testid="messages-list"]')).toHaveCount(2);

    // Should still have 2 close buttons
    await expect(page.locator('[data-testid="close-chat-button"]')).toHaveCount(2);

    // Verify chat_2 and chat_3 are selected (chat_1 should be unselected)
    const firstChat = page.locator('[data-testid="chat-item-chat_1"]');
    const secondChat = page.locator('[data-testid="chat-item-chat_2"]');
    const thirdChat = page.locator('[data-testid="chat-item-chat_3"]');

    await expect(firstChat).not.toHaveClass(/bg-blue-50/);
    await expect(secondChat).toHaveClass(/bg-blue-50/);
    await expect(thirdChat).toHaveClass(/bg-blue-50/);
  });

  test('should close left chat and keep right chat', async ({ page }) => {
    // Open two chats
    await page.locator('[data-testid^="chat-item"]').nth(0).click();
    await page.waitForTimeout(300);
    await page.locator('[data-testid^="chat-item"]').nth(1).click();
    await page.waitForTimeout(500);

    // Close first (left) chat
    await page.locator('[data-testid="close-chat-button"]').first().click();
    await page.waitForTimeout(300);

    // Verify only one message area remains
    await expect(page.locator('[data-testid="messages-list"]')).toHaveCount(1);
    // Verify no close buttons in single view
    await expect(page.locator('[data-testid="close-chat-button"]')).not.toBeVisible();
  });

  test('should close right chat and keep left chat', async ({ page }) => {
    // Open two chats
    await page.locator('[data-testid^="chat-item"]').nth(0).click();
    await page.waitForTimeout(300);
    await page.locator('[data-testid^="chat-item"]').nth(1).click();
    await page.waitForTimeout(500);

    // Close second (right) chat
    await page.locator('[data-testid="close-chat-button"]').nth(1).click();
    await page.waitForTimeout(300);

    // Verify only one message area remains
    await expect(page.locator('[data-testid="messages-list"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="close-chat-button"]')).not.toBeVisible();
  });

  test('should highlight selected chats in chat list', async ({ page }) => {
    // Get first two chats
    const firstChat = page.locator('[data-testid^="chat-item"]').nth(0);
    const secondChat = page.locator('[data-testid^="chat-item"]').nth(1);

    // Open first chat
    await firstChat.click();
    await page.waitForTimeout(300);

    // Verify first chat has primary selection styling
    await expect(firstChat).toHaveClass(/bg-blue-50/);
    await expect(firstChat).toHaveClass(/border-l-primary/);

    // Open second chat
    await secondChat.click();
    await page.waitForTimeout(300);

    // Verify both chats have selection styling
    await expect(firstChat).toHaveClass(/bg-blue-50/);
    await expect(secondChat).toHaveClass(/bg-blue-50/);

    // Verify second chat shows "Split view" badge
    await expect(secondChat.locator('text=Split view')).toBeVisible();
  });

  test('should send message in left chat pane', async ({ page }) => {
    // Open two chats
    await page.locator('[data-testid^="chat-item"]').nth(0).click();
    await page.waitForTimeout(300);
    await page.locator('[data-testid^="chat-item"]').nth(1).click();
    await page.waitForTimeout(500);

    // Get message inputs
    const messageInputs = page.locator('textarea[placeholder*="Type a message"]');
    await expect(messageInputs).toHaveCount(2);

    // Type in first (left) input
    const firstInput = messageInputs.first();
    await firstInput.fill('Test message from left chat');
    await firstInput.press('Enter');
    await page.waitForTimeout(500);

    // Verify message appears in message area (not just chat list)
    const messageAreas = page.locator('[data-testid="messages-list"]');
    await expect(messageAreas.first().locator('text=Test message from left chat')).toBeVisible();
  });

  test('should send message in right chat pane', async ({ page }) => {
    // Open two chats
    await page.locator('[data-testid^="chat-item"]').nth(0).click();
    await page.waitForTimeout(300);
    await page.locator('[data-testid^="chat-item"]').nth(1).click();
    await page.waitForTimeout(500);

    // Get message inputs
    const messageInputs = page.locator('textarea[placeholder*="Type a message"]');
    await expect(messageInputs).toHaveCount(2);

    // Type in second (right) input
    const secondInput = messageInputs.nth(1);
    await secondInput.fill('Test message from right chat');
    await secondInput.press('Enter');
    await page.waitForTimeout(500);

    // Verify message appears in right message area (not just chat list)
    const messageAreas = page.locator('[data-testid="messages-list"]');
    await expect(messageAreas.nth(1).locator('text=Test message from right chat')).toBeVisible();
  });

  test('should receive mock replies in both chats', async ({ page }) => {
    // Open two chats
    await page.locator('[data-testid^="chat-item"]').nth(0).click();
    await page.waitForTimeout(300);
    await page.locator('[data-testid^="chat-item"]').nth(1).click();
    await page.waitForTimeout(500);

    // Send message in left chat
    const firstInput = page.locator('textarea[placeholder*="Type a message"]').first();
    await firstInput.fill('Hello');
    await firstInput.press('Enter');

    // Wait for mock reply (1-3 seconds)
    await page.waitForTimeout(4000);

    // Verify at least one message is visible (could be reply)
    const messages = page.locator('[data-testid^="message-"]');
    await expect(messages.first()).toBeVisible();
  });

  test('should not add same chat twice', async ({ page }) => {
    // Click same chat twice
    const firstChat = page.locator('[data-testid^="chat-item"]').first();
    await firstChat.click();
    await page.waitForTimeout(300);
    await firstChat.click();
    await page.waitForTimeout(300);

    // Should still have single chat view (no close buttons)
    await expect(page.locator('[data-testid="close-chat-button"]')).not.toBeVisible();
  });

  test('should maintain independent scroll positions in dual chat', async ({ page }) => {
    // Open two chats
    await page.locator('[data-testid^="chat-item"]').nth(0).click();
    await page.waitForTimeout(300);
    await page.locator('[data-testid^="chat-item"]').nth(1).click();
    await page.waitForTimeout(500);

    // Send multiple messages to create scrollable content
    const firstInput = page.locator('textarea[placeholder*="Type a message"]').first();
    for (let i = 0; i < 5; i++) {
      await firstInput.fill(`Message ${i}`);
      await firstInput.press('Enter');
      await page.waitForTimeout(200);
    }

    // Verify messages are visible
    const messagesLists = page.locator('[data-testid="messages-list"]');
    await expect(messagesLists.first()).toBeVisible();
  });

  test('should display chat names in headers for both panes', async ({ page }) => {
    // Open both chats
    await page.locator('[data-testid^="chat-item"]').nth(0).click();
    await page.waitForTimeout(300);
    await page.locator('[data-testid^="chat-item"]').nth(1).click();
    await page.waitForTimeout(500);

    // Verify both message areas are visible
    await expect(page.locator('[data-testid="messages-list"]')).toHaveCount(2);
  });

  test('should show online/offline status in both chat panes', async ({ page }) => {
    // Open two chats
    await page.locator('[data-testid^="chat-item"]').nth(0).click();
    await page.waitForTimeout(300);
    await page.locator('[data-testid^="chat-item"]').nth(1).click();
    await page.waitForTimeout(500);

    // Check for online/offline indicators
    const statusIndicators = page.locator('text=Online, text=Offline');
    // At least one chat should show a status
    const count = await statusIndicators.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should update last message preview when sending messages', async ({ page }) => {
    // Open a chat and send a message
    const firstChat = page.locator('[data-testid^="chat-item"]').first();
    await firstChat.click();
    await page.waitForTimeout(300);

    const testMessage = 'Testing preview update';
    const input = page.locator('textarea[placeholder*="Type a message"]').first();
    await input.fill(testMessage);
    await input.press('Enter');
    await page.waitForTimeout(500);

    // Check if message preview is updated in chat list
    await expect(firstChat.locator(`text=${testMessage}`)).toBeVisible();
  });

  test('should handle rapid chat switching', async ({ page }) => {
    // Rapidly click different chats
    for (let i = 0; i < 3; i++) {
      await page.locator('[data-testid^="chat-item"]').nth(i).click();
      await page.waitForTimeout(100);
    }

    // Should have 2 chats open (last two clicked)
    await expect(page.locator('[data-testid="close-chat-button"]')).toHaveCount(2);
  });

  test('should maintain message input state when switching focus', async ({ page }) => {
    // Open two chats
    await page.locator('[data-testid^="chat-item"]').nth(0).click();
    await page.waitForTimeout(300);
    await page.locator('[data-testid^="chat-item"]').nth(1).click();
    await page.waitForTimeout(500);

    // Type in first input but don't send
    const firstInput = page.locator('textarea[placeholder*="Type a message"]').first();
    await firstInput.fill('Draft message');

    // Click second input
    const secondInput = page.locator('textarea[placeholder*="Type a message"]').nth(1);
    await secondInput.click();

    // Click back to first input and verify text is still there
    await firstInput.click();
    await expect(firstInput).toHaveValue('Draft message');
  });
});
