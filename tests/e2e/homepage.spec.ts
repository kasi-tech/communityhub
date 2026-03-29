import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads with hero section containing welcome heading', async ({ page }) => {
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Welcome to');
  });

  test('displays "Explore Events" CTA that navigates to /events', async ({ page }) => {
    const exploreBtn = page.getByRole('link', { name: /explore events/i });
    await expect(exploreBtn).toBeVisible();
    await exploreBtn.click();
    await expect(page).toHaveURL(/\/events/);
  });

  test('displays "Become a Member" CTA that navigates to /join', async ({ page }) => {
    const joinBtn = page.getByRole('link', { name: /become a member/i });
    await expect(joinBtn).toBeVisible();
    await joinBtn.click();
    await expect(page).toHaveURL(/\/join/);
  });

  test('shows upcoming events section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /upcoming events/i })).toBeVisible();
  });

  test('shows community stats section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /our community in numbers/i })).toBeVisible();
  });

  test('shows CTA section with "Join Now" button', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /ready to join/i })).toBeVisible();
    const joinNow = page.getByRole('link', { name: /join now/i });
    await expect(joinNow).toBeVisible();
  });

  test('desktop navigation links are visible', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: /main navigation/i });
    await expect(nav.getByRole('link', { name: 'Events' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Gallery' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Donate' })).toBeVisible();
  });

  test('navigation link "Events" goes to /events', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: /main navigation/i });
    await nav.getByRole('link', { name: 'Events' }).click();
    await expect(page).toHaveURL(/\/events/);
  });

  test('footer is visible with CommunityHub branding', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByText('CommunityHub')).toBeVisible();
  });
});

test.describe('Homepage — Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('hamburger menu opens and shows navigation links', async ({ page }) => {
    await page.goto('/');

    const hamburger = page.getByRole('button', { name: /toggle navigation menu/i });
    await expect(hamburger).toBeVisible();

    // Menu should not be visible before click
    const mobileNav = page.getByRole('navigation', { name: /mobile navigation/i });
    await expect(mobileNav).not.toBeVisible();

    // Open menu
    await hamburger.click();
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: 'Events' })).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: 'Gallery' })).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: 'Donate' })).toBeVisible();
  });

  test('hamburger menu closes when a link is clicked', async ({ page }) => {
    await page.goto('/');

    const hamburger = page.getByRole('button', { name: /toggle navigation menu/i });
    await hamburger.click();

    const mobileNav = page.getByRole('navigation', { name: /mobile navigation/i });
    await mobileNav.getByRole('link', { name: 'Events' }).click();

    await expect(page).toHaveURL(/\/events/);
  });
});
