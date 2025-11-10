import { test, expect } from '@playwright/test';

test.describe('Chat Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the application to load - look for the first chat item
    await page.waitForSelector('[data-testid^="chat-item-"]', { timeout: 5000 });
  });

  test('should display chat list on load', async ({ page }) => {
    // Check if chat list header is visible
    const chatListHeader = page.getByRole('heading', { name: 'Chats' });
    await expect(chatListHeader).toBeVisible();

    // Check if at least one chat is displayed
    const firstChat = page.locator('[data-testid^="chat-item-"]').first();
    await expect(firstChat).toBeVisible();
  });

  test('should select a chat and display messages', async ({ page }) => {
    // Click on the first chat
    const firstChat = page.locator('[data-testid^="chat-item-"]').first();
    await firstChat.click();

    // Wait for messages to load
    await page.waitForTimeout(500);

    // Check if message area header is visible with chat name
    const messageAreaHeader = page.locator('h5').nth(1); // Second h5 (first is "Chats")
    await expect(messageAreaHeader).toBeVisible();

    // Check if message input is visible
    const messageInput = page.locator('[data-testid="message-input"]');
    await expect(messageInput).toBeVisible();
  });

  test('should send a message', async ({ page }) => {
    // Select a chat
    const firstChat = page.locator('[data-testid^="chat-item-"]').first();
    await firstChat.click();

    await page.waitForTimeout(500);

    // Get initial message count
    const messagesBefore = await page.locator('[data-testid^="message-"]').count();

    // Type a message
    const messageInput = page.locator('[data-testid="message-input"]');
    const testMessage = 'Hello from Playwright test!';
    await messageInput.fill(testMessage);

    // Click send button
    const sendButton = page.locator('[data-testid="send-button"]');
    await sendButton.click();

    // Wait for message to appear
    await page.waitForTimeout(500);

    // Verify a new message was added
    const messagesAfter = await page.locator('[data-testid^="message-"]').count();
    expect(messagesAfter).toBeGreaterThan(messagesBefore);

    // Verify input is cleared
    await expect(messageInput).toHaveValue('');
  });

  test('should send message with Enter key', async ({ page }) => {
    // Select a chat
    const firstChat = page.locator('[data-testid^="chat-item-"]').first();
    await firstChat.click();

    await page.waitForTimeout(500);

    // Get initial message count
    const messagesBefore = await page.locator('[data-testid^="message-"]').count();

    // Type a message and press Enter
    const messageInput = page.locator('[data-testid="message-input"]');
    const testMessage = 'Message sent with Enter key';
    await messageInput.fill(testMessage);
    await messageInput.press('Enter');

    // Wait for message to appear
    await page.waitForTimeout(500);

    // Verify a new message was added
    const messagesAfter = await page.locator('[data-testid^="message-"]').count();
    expect(messagesAfter).toBeGreaterThan(messagesBefore);
  });

  test('should not send empty message', async ({ page }) => {
    // Select a chat
    const firstChat = page.locator('[data-testid^="chat-item-"]').first();
    await firstChat.click();

    await page.waitForTimeout(500);

    // Verify send button is disabled when input is empty
    const sendButton = page.locator('[data-testid="send-button"]');
    await expect(sendButton).toBeDisabled();
  });

  test('should display message in chat list preview', async ({ page }) => {
    // Select a chat
    const firstChat = page.locator('[data-testid^="chat-item-"]').first();
    await firstChat.click();

    await page.waitForTimeout(500);

    // Send a message
    const messageInput = page.locator('[data-testid="message-input"]');
    const testMessage = 'This should appear in preview';
    await messageInput.fill(testMessage);

    const sendButton = page.locator('[data-testid="send-button"]');
    await sendButton.click();

    await page.waitForTimeout(500);

    // Check if message appears in chat list preview (last message content in chat item)
    const chatPreview = firstChat.locator('.text-sm.text-truncate');
    await expect(chatPreview).toContainText(testMessage);
  });

  test('should highlight selected chat', async ({ page }) => {
    // Click on the first chat
    const firstChat = page.locator('[data-testid^="chat-item-"]').first();
    await firstChat.click();

    // Verify chat has active class
    await expect(firstChat).toHaveClass(/active/);
  });

  test('should switch between chats', async ({ page }) => {
    // Get first and second chat
    const firstChat = page.locator('[data-testid^="chat-item-"]').nth(0);
    const secondChat = page.locator('[data-testid^="chat-item-"]').nth(1);

    // Click first chat
    await firstChat.click();
    await page.waitForTimeout(300);
    await expect(firstChat).toHaveClass(/bg-blue-50.*border-l-primary/);

    // Click second chat - this opens dual-chat view in the new implementation
    await secondChat.click();
    await page.waitForTimeout(300);
    // Both chats should be highlighted now (dual-chat mode)
    await expect(firstChat).toHaveClass(/bg-blue-50/);
    await expect(secondChat).toHaveClass(/bg-blue-50/);
  });

  test('should show avatar or initial in chat list', async ({ page }) => {
    const firstChat = page.locator('[data-testid^="chat-item-"]').first();

    // Look for the avatar container (w-12 h-12 flex-shrink-0 relative)
    const avatarContainer = firstChat.locator('.w-12.h-12').first();
    await expect(avatarContainer).toBeVisible();

    // Check if it has either an image or a placeholder with initial
    const hasImage = await avatarContainer.locator('img').count();
    const hasInitialPlaceholder = await avatarContainer.locator('.rounded-full.bg-primary').count();

    expect(hasImage + hasInitialPlaceholder).toBeGreaterThan(0);
  });
});
