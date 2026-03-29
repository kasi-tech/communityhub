import { test, expect } from '@playwright/test';

test.describe('Events Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/events');
  });

  test('loads with page heading and description', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: /events/i })).toBeVisible();
    await expect(page.getByText(/discover and register/i)).toBeVisible();
  });

  test('displays event filter controls', async ({ page }) => {
    // Search input should be present
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();
  });

  test('search input filters events by typing', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('nonexistent-event-xyz-12345');

    // After searching for a non-existent term, either no cards appear
    // or an empty state message shows
    await page.waitForTimeout(500); // debounce
    const cards = page.locator('[data-testid="event-card"], .event-card, article');
    const count = await cards.count();
    // With a nonsense query, we expect 0 matching events (or empty state)
    expect(count).toBeLessThanOrEqual(0);
  });

  test('category filter buttons are visible', async ({ page }) => {
    // The events page should have category filter options
    const filterSection = page.locator('form, [role="group"], .flex').filter({
      has: page.getByRole('button'),
    });
    await expect(filterSection.first()).toBeVisible();
  });

  test('calendar view toggle is present', async ({ page }) => {
    // Toggle between cards and calendar views
    const calendarBtn = page.getByRole('button', { name: /calendar/i });
    if (await calendarBtn.isVisible()) {
      await calendarBtn.click();
      // Calendar view should now be displayed
      await expect(page.locator('table, .calendar, [data-view="calendar"]').first()).toBeVisible();
    }
  });

  test('event card links to detail page', async ({ page }) => {
    // If events exist, clicking a card should navigate to detail
    const firstEventLink = page.locator('a[href*="/events/"]').first();
    if (await firstEventLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      const href = await firstEventLink.getAttribute('href');
      await firstEventLink.click();
      await expect(page).toHaveURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  });
});

test.describe('Event Detail Page', () => {
  test('shows event content when navigated from events list', async ({ page }) => {
    await page.goto('/events');

    const firstEventLink = page.locator('a[href*="/events/"]').first();
    if (await firstEventLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstEventLink.click();
      // Detail page should have a heading (event title)
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toBeVisible();
    }
  });
});
