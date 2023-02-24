const {expect, test} = require('@playwright/test');
const {createMember, impersonateMember} = require('../utils');

const addNewsletter = async (page) => {
    // go to email settings
    await page.goto('/ghost');
    await page.locator('[data-test-nav="settings"]').click();
    await page.locator('[data-test-nav="members-email"]').click();

    // create newsletter
    await page.locator('[data-test-button="add-newsletter"]').click();
    await page.locator('[data-test-newsletter-title-input]').click();
    await page.locator('[data-test-newsletter-title-input]').fill('One more newsletter');
    await page.locator('[data-test-button="save-newsletter"]').click();

    // check that newsletter was added
    await page.waitForSelector('[data-test-newsletter="one-more-newsletter"]');
};

test.describe('Portal', () => {
    test.describe('Member actions', () => {
        test('can log out', async ({page}) => {
            // create a new free member
            await createMember(page, {
                name: 'Test Member Signout',
                email: 'test.member.signout@example.com',
                note: 'Test Member'
            });

            // impersonate the member on frontend
            impersonateMember(page);

            // open portal
            const portalTriggerButton = page.frameLocator('[data-testid="portal-trigger-frame"]').locator('[data-testid="portal-trigger-button"]');
            const portalFrame = page.frameLocator('[data-testid="portal-popup-frame"]');

            // sign out
            await portalTriggerButton.click();
            await portalFrame.locator('[data-test-button="footer-signout"]').click();

            // check that sign out was successful and 'Sign in' button is available
            await portalTriggerButton.click();
            await expect(portalFrame.locator('[data-test-button="signin-switch"]')).toBeVisible();
        });

        test('can unsubscribe from newsletter from account settings', async ({page}) => {
            // create a new free member
            await createMember(page, {
                name: 'Test Member',
                email: 'test.member@example.com',
                note: 'Test Member'
            });
            //get the url of the current member on admin
            const memberUrl = page.url();

            // impersonate the member on frontend
            impersonateMember(page);

            const portalTriggerButton = page.frameLocator('[data-testid="portal-trigger-frame"]').locator('[data-testid="portal-trigger-button"]');
            const portalFrame = page.frameLocator('[data-testid="portal-popup-frame"]');

            // open portal
            await portalTriggerButton.click();

            // turn off default newsletter subscription
            const defaultNewsletterToggle = portalFrame.locator('[data-testid="default-newsletter-toggle"]');
            expect(await defaultNewsletterToggle.isChecked()).toBeTruthy();
            await defaultNewsletterToggle.click();
            expect(await defaultNewsletterToggle.isChecked()).not.toBeTruthy();

            // check that member's newsletters was updated in Admin
            await page.goto(memberUrl);
            expect(await page.locator('[data-test-member-settings-switch] input[type=checkbox]').first().isChecked()).not.toBeTruthy();
        });

        test('can unsubscribe from all newsletters from account settings', async ({page}) => {
            // create a new free member
            await createMember(page, {
                name: 'Test Member All Unsubscribe',
                email: 'test.member2@example.com',
                note: 'Test Member'
            });
            // get the url of the current member on admin
            const memberUrl = page.url();

            // add one more newsletter to have multiple
            await addNewsletter(page);

            // impersonate the member on frontend
            await page.goto(memberUrl);
            impersonateMember(page);

            const portalTriggerButton = page.frameLocator('[data-testid="portal-trigger-frame"]').locator('[data-testid="portal-trigger-button"]');
            const portalFrame = page.frameLocator('[data-testid="portal-popup-frame"]');

            // open portal
            await portalTriggerButton.click();
            await portalFrame.locator('[data-test-button="manage-newsletters"]').click();

            // check amount of newsletterss
            const newsletters = await portalFrame.locator('[data-test-toggle-wrapper="true"]');
            const count = await newsletters.count();
            expect(count).toEqual(2);

            // all newsletters should be activated
            for (let i = 0; i < count; i++) {
                expect(await newsletters.nth(i).locator('input[type="checkbox"]').isChecked()).toBeTruthy();
            }

            // unsubscribe from all emails
            await portalFrame.locator('[data-test-button="unsubscribe-from-all-emails"]').click();

            // all newsletters should be disabled
            for (let i = 0; i < count; i++) {
                expect(await newsletters.nth(i).locator('input[type="checkbox"]').isChecked()).not.toBeTruthy();
            }

            // check that member's newsletters was updated in Admin
            await page.goto(memberUrl);

            // check amount of newsletters in member's profile in Admin
            await page.waitForSelector('[data-test-member-settings-switch]');
            const membersNewsletters = await page.locator('[data-test-member-settings-switch]');
            const newslettersCount = await membersNewsletters.count();
            expect(newslettersCount).toEqual(2);

            // all newsletters should be disabled
            for (let i = 0; i < newslettersCount; i++) {
                const isNewsletterChecked = await membersNewsletters.nth(i).locator('input[type="checkbox"]').isChecked();
                expect(isNewsletterChecked).not.toBeTruthy();
            }
        });
    });
});
