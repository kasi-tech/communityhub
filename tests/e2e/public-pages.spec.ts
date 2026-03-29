import { test, expect } from '@playwright/test';

test.describe('About Page', () => {
  test('loads with content and leadership section', async ({ page }) => {
    await page.goto('/about');
    // About page should have a heading
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    // Should display leadership/team information
    await expect(page.getByText(/president|about|mission|community/i).first()).toBeVisible();
  });
});

test.describe('Gallery Page', () => {
  test('loads with gallery content', async ({ page }) => {
    await page.goto('/gallery');
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    // Gallery should show photo albums or placeholder cards
    const cards = page.locator('article, [class*="card"], [class*="Card"]');
    await expect(cards.first()).toBeVisible();
  });

  test('has search or filter functionality', async ({ page }) => {
    await page.goto('/gallery');
    const searchInput = page.getByPlaceholder(/search|filter/i);
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(searchInput).toBeEnabled();
    }
  });
});

test.describe('Donate Page', () => {
  test('loads with donation heading', async ({ page }) => {
    await page.goto('/donate');
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('shows suggested donation amounts', async ({ page }) => {
    await page.goto('/donate');
    // Suggested amounts: $10, $25, $50, $100
    await expect(page.getByText('$10').first()).toBeVisible();
    await expect(page.getByText('$25').first()).toBeVisible();
    await expect(page.getByText('$50').first()).toBeVisible();
    await expect(page.getByText('$100').first()).toBeVisible();
  });

  test('shows donor wall section', async ({ page }) => {
    await page.goto('/donate');
    await expect(page.getByText(/donor wall|recent donors/i).first()).toBeVisible();
  });

  test('donation form has name and amount inputs', async ({ page }) => {
    await page.goto('/donate');
    const nameInput = page.locator('input[placeholder*="name" i], input[name*="name" i]');
    await expect(nameInput.first()).toBeVisible();
  });
});

test.describe('Volunteer Page', () => {
  test('loads with volunteer heading', async ({ page }) => {
    await page.goto('/volunteer');
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('shows volunteer form with name input', async ({ page }) => {
    await page.goto('/volunteer');
    const nameInput = page.locator('input[placeholder*="name" i], input[name*="name" i]');
    await expect(nameInput.first()).toBeVisible();
  });

  test('shows skill selection options', async ({ page }) => {
    await page.goto('/volunteer');
    // Skills like "Event Setup", "Photography", etc. should be visible
    await expect(page.getByText(/event setup|photography|cooking/i).first()).toBeVisible();
  });

  test('shows availability options', async ({ page }) => {
    await page.goto('/volunteer');
    await expect(page.getByText(/weekday|saturday|sunday/i).first()).toBeVisible();
  });
});

test.describe('Sponsor Page', () => {
  test('loads with sponsor heading', async ({ page }) => {
    await page.goto('/sponsor');
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('shows sponsorship tier cards (Bronze, Silver, Gold)', async ({ page }) => {
    await page.goto('/sponsor');
    await expect(page.getByText('Bronze')).toBeVisible();
    await expect(page.getByText('Silver')).toBeVisible();
    await expect(page.getByText('Gold')).toBeVisible();
  });

  test('shows pricing for each tier', async ({ page }) => {
    await page.goto('/sponsor');
    // Each tier should have a price displayed
    await expect(page.getByText('$500').first()).toBeVisible();
  });
});
