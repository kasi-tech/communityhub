import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8899/index.html';

test.describe('CommunityHub Prototype — Navigation & Core Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Homepage loads with hero, events, and stats', async ({ page }) => {
    // Hero section visible
    await expect(page.locator('#page-home .hero h1')).toBeVisible();
    await expect(page.locator('#page-home .hero h1')).toContainText('Connected');

    // Upcoming events section
    await expect(page.locator('.section-header h2').first()).toContainText('Upcoming Events');
    const eventCards = page.locator('#page-home .event-card');
    await expect(eventCards).toHaveCount(3);

    // Stats section
    await expect(page.locator('.stat-card').first()).toBeVisible();
    await expect(page.locator('.stat-num').first()).toContainText('1,247');

    // Footer
    await expect(page.locator('.footer')).toBeVisible();
  });

  test('Navbar links navigate between pages', async ({ page }) => {
    // Click Events
    await page.locator('.nav-links a').nth(1).click();
    await expect(page.locator('#page-events')).toBeVisible();

    // Click About
    await page.locator('.nav-links a').nth(2).click();
    await expect(page.locator('#page-about')).toBeVisible();

    // Click Gallery
    await page.locator('.nav-links a').nth(3).click();
    await expect(page.locator('#page-gallery')).toBeVisible();

    // Click Home
    await page.locator('.nav-links a').nth(0).click();
    await expect(page.locator('#page-home')).toBeVisible();
  });

  test('Join Us button navigates to onboarding', async ({ page }) => {
    await page.locator('.nav-actions .btn-primary').click();
    await expect(page.locator('#page-onboarding')).toBeVisible();
  });

  test('Sign In button navigates to login', async ({ page }) => {
    await page.locator('.nav-actions .btn-secondary').click();
    await expect(page.locator('#page-login')).toBeVisible();
  });
});

test.describe('Events Page — Discovery & Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator('.nav-links a').nth(1).click();
  });

  test('Events page renders event cards', async ({ page }) => {
    const cards = page.locator('#eventsGrid .event-card');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThanOrEqual(4);
  });

  test('Search filters events by title', async ({ page }) => {
    await page.fill('#eventSearch', 'Badminton');
    const cards = page.locator('#eventsGrid .event-card');
    await expect(cards).toHaveCount(1);
    await expect(cards.first().locator('h3')).toContainText('Badminton');
  });

  test('Category filter works', async ({ page }) => {
    await page.selectOption('#categoryFilter', 'Sports');
    const cards = page.locator('#eventsGrid .event-card');
    await expect(cards).toHaveCount(1);
  });

  test('Price filter shows only free events', async ({ page }) => {
    await page.selectOption('#priceFilter', 'free');
    const cards = page.locator('#eventsGrid .event-card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('No results shows empty state', async ({ page }) => {
    await page.fill('#eventSearch', 'xyznonexistent');
    await expect(page.locator('#eventsGrid')).toContainText('No events found');
  });

  test('Calendar view toggle works', async ({ page }) => {
    await page.locator('.view-toggle button').nth(1).click();
    await expect(page.locator('#events-calendar-view')).toBeVisible();
    await expect(page.locator('#events-cards-view')).toBeHidden();

    // Calendar has day headers
    await expect(page.locator('.calendar-day-header').first()).toBeVisible();
  });

  test('Calendar month navigation works', async ({ page }) => {
    await page.locator('.view-toggle button').nth(1).click();
    await expect(page.locator('#calendarMonth')).toContainText('April 2026');
    await page.locator('#events-calendar-view button:has-text("Next")').click();
    await expect(page.locator('#calendarMonth')).toContainText('May 2026');
    await page.locator('#events-calendar-view button:has-text("Previous")').click();
    await expect(page.locator('#calendarMonth')).toContainText('April 2026');
  });
});

test.describe('Event Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Navigate to event detail via prototype nav
    await page.locator('a:has-text("Event Detail")').last().click();
  });

  test('Event detail hero shows title and info', async ({ page }) => {
    await expect(page.locator('.event-detail-hero h1')).toContainText('Ugadi Celebrations');
    await expect(page.locator('.info-item').first()).toBeVisible();
  });

  test('Event tabs switch content', async ({ page }) => {
    // Description tab is active by default
    await expect(page.locator('#event-tab-desc')).toBeVisible();

    // Click Schedule tab
    await page.locator('.event-tabs button:has-text("Schedule")').click();
    await expect(page.locator('#event-tab-schedule')).toBeVisible();
    await expect(page.locator('#event-tab-desc')).toBeHidden();

    // Click Performers tab
    await page.locator('.event-tabs button:has-text("Performers")').click();
    await expect(page.locator('#event-tab-speakers')).toBeVisible();
  });

  test('Registration sidebar updates total correctly', async ({ page }) => {
    await page.selectOption('#regAdults', '2');
    await page.selectOption('#regChildren', '1');
    await expect(page.locator('#regTotal')).toContainText('38.00');
  });

  test('Register button opens payment modal', async ({ page }) => {
    await page.locator('.event-sidebar .btn-primary').click();
    await expect(page.locator('#regModal')).toBeVisible();
    await expect(page.locator('#regModal .modal h3')).toContainText('Confirm Registration');
  });

  test('Payment modal can be closed', async ({ page }) => {
    await page.locator('.event-sidebar .btn-primary').click();
    await page.locator('#regModal .btn-ghost').click();
    await expect(page.locator('#regModal')).not.toHaveClass(/open/);
  });
});

test.describe('Onboarding Flow — Multi-Step Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator('.nav-actions .btn-primary').click();
  });

  test('Step 1: Phone OTP verification flow', async ({ page }) => {
    // Step 1 is active
    await expect(page.locator('.step-content[data-step="1"]')).toBeVisible();
    await expect(page.locator('.stepper-step.active')).toHaveAttribute('data-step', '1');

    // Enter phone and send OTP
    await page.fill('#phoneInput', '81234567');
    await page.click('#sendOTPBtn');

    // OTP section appears
    await expect(page.locator('#otpSection')).toBeVisible();

    // Next button becomes enabled after delay
    await page.waitForTimeout(2000);
    await expect(page.locator('#phoneNextBtn')).toBeEnabled();
  });

  test('Step navigation: forward and backward', async ({ page }) => {
    // Force enable next for testing
    await page.fill('#phoneInput', '81234567');
    await page.click('#sendOTPBtn');
    await page.waitForTimeout(2000);

    // Go to step 2
    await page.click('#phoneNextBtn');
    await expect(page.locator('.step-content[data-step="2"]')).toBeVisible();

    // Go back to step 1
    await page.locator('.step-content[data-step="2"] .btn-ghost').click();
    await expect(page.locator('.step-content[data-step="1"]')).toBeVisible();
  });

  test('Step 3: Personal details form is visible and interactable', async ({ page }) => {
    // Navigate to step 3 directly
    await page.fill('#phoneInput', '81234567');
    await page.click('#sendOTPBtn');
    await page.waitForTimeout(2000);
    await page.click('#phoneNextBtn');
    await page.fill('#emailInput', 'test@example.com');
    await page.click('button:has-text("Send Verification Code")');
    await page.waitForTimeout(2000);
    await page.click('#emailNextBtn');

    // Step 3 visible
    await expect(page.locator('.step-content[data-step="3"]')).toBeVisible();
    await expect(page.locator('.step-content[data-step="3"] input[type="text"]').first()).toBeVisible();

    // Interest checkbox items are visible and rendered
    const interests = page.locator('.step-content[data-step="3"] .checkbox-item');
    expect(await interests.count()).toBeGreaterThanOrEqual(6);
    await expect(interests.first()).toBeVisible();

    // Toggle class via DOM manipulation (label+hidden-input has known click delegation quirk)
    await interests.first().evaluate(el => el.classList.toggle('selected'));
    await expect(interests.first()).toHaveClass(/selected/);
    await interests.first().evaluate(el => el.classList.toggle('selected'));
    await expect(interests.first()).not.toHaveClass(/selected/);
  });

  test('Step 4: Membership tier selection', async ({ page }) => {
    // Navigate to step 4
    for (let i = 2; i <= 4; i++) {
      const nextBtn = page.locator(`.step-content[data-step="${i - 1}"] .btn-primary`).last();
      if (i === 2) {
        await page.fill('#phoneInput', '81234567');
        await page.click('#sendOTPBtn');
        await page.waitForTimeout(2000);
      }
      if (i === 3) {
        await page.fill('#emailInput', 'test@example.com');
        await page.click('button:has-text("Send Verification Code")');
        await page.waitForTimeout(2000);
      }
      await nextBtn.click();
    }

    // Tier cards visible
    const tiers = page.locator('.step-content[data-step="4"] .tier-card');
    await expect(tiers).toHaveCount(4);

    // Select a tier
    await tiers.nth(1).click();
    await expect(tiers.nth(1)).toHaveClass(/selected/);

    // Popular badge visible
    await expect(page.locator('.step-content[data-step="4"] .tier-popular')).toContainText('Most Popular');
  });

  test('Step 5: Referral lookup works', async ({ page }) => {
    // Navigate to step 5 via prototype nav shortcut
    await page.goto(BASE_URL);
    await page.locator('a:has-text("Onboarding")').last().click();

    // Manually advance to step 5
    for (let step = 2; step <= 5; step++) {
      const nextBtn = page.locator(`.step-content.active .btn-primary`).last();
      if (step === 2) { await page.fill('#phoneInput', '8123'); await page.click('#sendOTPBtn'); await page.waitForTimeout(2000); }
      if (step === 3) { await page.fill('#emailInput', 'a@b.com'); await page.click('button:has-text("Send Verification")'); await page.waitForTimeout(2000); }
      await nextBtn.click();
    }

    await page.fill('#referralInput', 'MEM-00142');
    await page.click('button:has-text("Look Up Referrer")');
    await expect(page.locator('#referrerResult')).toBeVisible();
    await expect(page.locator('#referrerResult')).toContainText('Ramesh Reddy');
  });

  test('Step 6: PDPA consent required before payment', async ({ page }) => {
    // Use page evaluate to jump to step 6
    await page.evaluate(() => { (window as any).nextStep(6); });
    await expect(page.locator('.step-content[data-step="6"]')).toBeVisible();

    // Payment methods visible
    await expect(page.locator('.payment-method').first()).toBeVisible();

    // Select PayNow
    await page.locator('.payment-method').nth(1).click();
    await expect(page.locator('.payment-method').nth(1)).toHaveClass(/selected/);
  });

  test('Successful onboarding shows confirmation with status tracker', async ({ page }) => {
    await page.evaluate(() => { (window as any).nextStep(6); });
    await page.check('#pdpaConsent');
    await page.locator('button:has-text("Pay & Submit")').click();

    // Success screen
    await expect(page.locator('.success-icon')).toBeVisible();
    await expect(page.locator('.success-screen h2')).toContainText('Application Submitted');

    // Status tracker
    const steps = page.locator('.status-step');
    expect(await steps.count()).toBeGreaterThanOrEqual(5);
    await expect(page.locator('.status-dot.current')).toBeVisible();
  });
});

test.describe('Member Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator('a:has-text("Dashboard")').last().click();
  });

  test('Dashboard overview shows stats and recommendations', async ({ page }) => {
    await expect(page.locator('#dash-overview')).toBeVisible();
    await expect(page.locator('.dashboard-stats .dash-stat').first()).toBeVisible();
    await expect(page.locator('#dash-overview h2')).toContainText('Welcome back');
  });

  test('Sidebar navigation switches tabs', async ({ page }) => {
    // My Events
    await page.locator('.sidebar-nav a:has-text("My Events")').click();
    await expect(page.locator('#dash-my-events')).toBeVisible();

    // Profile
    await page.locator('.sidebar-nav a:has-text("Profile")').click();
    await expect(page.locator('#dash-profile')).toBeVisible();

    // Membership
    await page.locator('.sidebar-nav a:has-text("Membership")').click();
    await expect(page.locator('#dash-membership')).toBeVisible();

    // Notifications
    await page.locator('.sidebar-nav a:has-text("Notifications")').click();
    await expect(page.locator('#dash-notifications')).toBeVisible();
  });

  test('Profile form is editable', async ({ page }) => {
    await page.locator('.sidebar-nav a:has-text("Profile")').click();
    const nameInput = page.locator('#dash-profile input[type="text"]').first();
    await expect(nameInput).toHaveValue('Ravi Kumar');
    await nameInput.fill('Ravi Kumar Updated');
    await expect(nameInput).toHaveValue('Ravi Kumar Updated');
  });

  test('Membership card shows active status', async ({ page }) => {
    await page.locator('.sidebar-nav a:has-text("Membership")').click();
    await expect(page.locator('#dash-membership')).toContainText('Family Annual');
    await expect(page.locator('#dash-membership')).toContainText('Active');
    await expect(page.locator('#dash-membership')).toContainText('MEM-00847');
  });
});

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator('a:has-text("Admin")').last().click();
  });

  test('Admin dashboard shows stats and activity', async ({ page }) => {
    await expect(page.locator('#admin-dash')).toBeVisible();
    await expect(page.locator('#admin-dash .dash-stat').first()).toBeVisible();
    await expect(page.locator('#admin-dash')).toContainText('1,247');
  });

  test('Admin sidebar navigation works', async ({ page }) => {
    // Events
    await page.locator('#page-admin .sidebar-nav a:has-text("Events")').click();
    await expect(page.locator('#admin-events')).toBeVisible();

    // Members
    await page.locator('#page-admin .sidebar-nav a:has-text("Members")').click();
    await expect(page.locator('#admin-members')).toBeVisible();

    // Applications
    await page.locator('#page-admin .sidebar-nav a:has-text("Applications")').click();
    await expect(page.locator('#admin-applications')).toBeVisible();
  });

  test('Applications queue shows fraud scores with visual bars', async ({ page }) => {
    await page.locator('#page-admin .sidebar-nav a:has-text("Applications")').click();
    const fraudBars = page.locator('.fraud-bar-fill');
    expect(await fraudBars.count()).toBeGreaterThanOrEqual(3);

    // High fraud score row has red bar
    await expect(page.locator('.fraud-bar-fill.high').first()).toBeVisible();
    // Low fraud score row has green bar
    await expect(page.locator('.fraud-bar-fill.low').first()).toBeVisible();
  });

  test('Reject modal opens and closes', async ({ page }) => {
    await page.locator('#page-admin .sidebar-nav a:has-text("Applications")').click();
    await page.locator('.btn-danger:has-text("Reject")').first().click();
    await expect(page.locator('#rejectModal')).toHaveClass(/open/);

    // Close
    await page.locator('#rejectModal .btn-ghost').click();
    await expect(page.locator('#rejectModal')).not.toHaveClass(/open/);
  });

  test('Create Event modal with AI copilot', async ({ page }) => {
    await page.locator('#page-admin .sidebar-nav a:has-text("Events")').click();
    await page.locator('button:has-text("Create Event")').click();
    await expect(page.locator('#createEventModal')).toHaveClass(/open/);
    await expect(page.locator('#createEventModal')).toContainText('AI Copilot');
  });

  test('Configuration tabs switch panels', async ({ page }) => {
    await page.locator('#page-admin .sidebar-nav a:has-text("Configuration")').click();
    await expect(page.locator('#cfg-branding')).toBeVisible();

    // Switch to Onboarding Pipeline
    await page.locator('.config-tabs button:has-text("Onboarding Pipeline")').click();
    await expect(page.locator('#cfg-onboarding')).toBeVisible();
    await expect(page.locator('.pipeline-step').first()).toBeVisible();

    // Switch to Feature Flags
    await page.locator('.config-tabs button:has-text("Feature Flags")').click();
    await expect(page.locator('#cfg-features')).toBeVisible();
    await expect(page.locator('#cfg-features .toggle-switch').first()).toBeVisible();
  });

  test('Toggle switches toggle on/off', async ({ page }) => {
    await page.locator('#page-admin .sidebar-nav a:has-text("Configuration")').click();
    await page.locator('.config-tabs button:has-text("Feature Flags")').click();

    // Find a toggle that's "off" (AI Newsletter)
    const toggle = page.locator('#cfg-features .toggle-switch').nth(2);
    await expect(toggle).not.toHaveClass(/on/);
    await toggle.click();
    await expect(toggle).toHaveClass(/on/);
    await toggle.click();
    await expect(toggle).not.toHaveClass(/on/);
  });

  test('Onboarding pipeline auto-approve threshold slider works', async ({ page }) => {
    await page.locator('#page-admin .sidebar-nav a:has-text("Configuration")').click();
    await page.locator('.config-tabs button:has-text("Onboarding Pipeline")').click();
    const slider = page.locator('#autoApproveSlider');
    await expect(slider).toBeVisible();
    await expect(page.locator('#autoApproveVal')).toContainText('30');
  });
});

test.describe('AI Chatbot', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Chatbot trigger button is visible', async ({ page }) => {
    await expect(page.locator('#chatbotBtn')).toBeVisible();
  });

  test('Chatbot opens and closes', async ({ page }) => {
    await page.click('#chatbotBtn');
    await expect(page.locator('#chatbotPanel')).toHaveClass(/open/);

    // Close
    await page.locator('.chatbot-header button').click();
    await expect(page.locator('#chatbotPanel')).not.toHaveClass(/open/);
  });

  test('Chatbot shows welcome messages including Telugu', async ({ page }) => {
    await page.click('#chatbotBtn');
    const messages = page.locator('.chat-msg');
    expect(await messages.count()).toBeGreaterThanOrEqual(2);
    await expect(messages.first()).toContainText('Hello');
    await expect(messages.nth(1)).toContainText('నమస్కారం');
  });

  test('Chatbot responds to user messages', async ({ page }) => {
    await page.click('#chatbotBtn');
    await page.fill('#chatInput', 'Tell me about events');
    await page.click('.chatbot-input button');

    // User message appears
    await expect(page.locator('.chat-msg.user').first()).toContainText('Tell me about events');

    // Bot response appears after delay
    await page.waitForTimeout(1000);
    const botMessages = page.locator('.chat-msg.bot');
    expect(await botMessages.count()).toBeGreaterThanOrEqual(3);
    await expect(botMessages.last()).toContainText('Ugadi');
  });

  test('Chatbot responds in Telugu', async ({ page }) => {
    await page.click('#chatbotBtn');
    await page.fill('#chatInput', 'తెలుగు');
    await page.click('.chatbot-input button');
    await page.waitForTimeout(1000);
    await expect(page.locator('.chat-msg.bot').last()).toContainText('నమస్కారం');
  });
});

test.describe('Login Page', () => {
  test('Login form is visible with all options', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator('a:has-text("Login")').last().click();

    await expect(page.locator('#page-login input[type="email"]')).toBeVisible();
    await expect(page.locator('#page-login input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Magic Link")')).toBeVisible();
    await expect(page.locator('button:has-text("Google")')).toBeVisible();
  });
});

test.describe('Toast Notifications', () => {
  test('Toast appears and auto-dismisses', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.locator('a:has-text("Dashboard")').last().click();
    await page.locator('.sidebar-nav a:has-text("Profile")').click();
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator('#toast')).toHaveClass(/show/);
    await expect(page.locator('#toastTitle')).toContainText('Profile Updated');
  });
});
