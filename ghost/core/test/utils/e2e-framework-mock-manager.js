const errors = require('@tryghost/errors');
const sinon = require('sinon');
const assert = require('assert');
const nock = require('nock');

// Helper services
const configUtils = require('./configUtils');
const WebhookMockReceiver = require('@tryghost/webhook-mock-receiver');
const EmailMockReceiver = require('@tryghost/email-mock-receiver');
const {snapshotManager} = require('@tryghost/express-test').snapshot;

let mocks = {};
let emailCount = 0;

// Mockable services
const mailService = require('../../core/server/services/mail/index');
const originalMailServiceSend = mailService.GhostMailer.prototype.send;
const labs = require('../../core/shared/labs');
const events = require('../../core/server/lib/common/events');
const settingsCache = require('../../core/shared/settings-cache');
const dnsPromises = require('dns').promises;

let fakedLabsFlags = {};
const originalLabsIsSet = labs.isSet;

/**
 * Stripe Mocks
 */

const disableStripe = async () => {
    // This must be required _after_ startGhost has been called, because the models will
    // not have been loaded otherwise. Consider moving the dependency injection of models
    // into the init method of the Stripe service.
    const stripeService = require('../../core/server/services/stripe');
    await stripeService.disconnect();
};

const mockStripe = () => {
    nock.disableNetConnect();
};

const disableNetwork = () => {
    nock.disableNetConnect();

    // externalRequest does dns lookup; stub to make sure we don't fail with fake domain names
    sinon.stub(dnsPromises, 'lookup').callsFake(() => {
        return Promise.resolve({address: '123.123.123.123', family: 4});
    });
};

/**
 * Email Mocks & Assertions
 */

/**
 * @param {String|Object} response
 */
const mockMail = (response = 'Mail is disabled') => {
    const mockMailReceiver = new EmailMockReceiver({
        snapshotManager: snapshotManager,
        sendResponse: response
    });

    mailService.GhostMailer.prototype.send = mockMailReceiver.send.bind(mockMailReceiver);
    mocks.mail = sinon.spy(mailService.GhostMailer.prototype, 'send');
    mocks.mockMailReceiver = mockMailReceiver;

    return mockMailReceiver;
};

const mockWebhookRequests = () => {
    mocks.webhookMockReceiver = new WebhookMockReceiver({snapshotManager});

    return mocks.webhookMockReceiver;
};

/**
 * @deprecated use emailMockReceiver.sentEmailCount(count) instead
 * @param {Number} count number of emails sent
 */
const sentEmailCount = (count) => {
    if (!mocks.mail) {
        throw new errors.IncorrectUsageError({
            message: 'Cannot assert on mail when mail has not been mocked'
        });
    }

    mocks.mockMailReceiver.sentEmailCount(count);
};

const sentEmail = (matchers) => {
    if (!mocks.mail) {
        throw new errors.IncorrectUsageError({
            message: 'Cannot assert on mail when mail has not been mocked'
        });
    }

    let spyCall = mocks.mail.getCall(emailCount);

    assert.notEqual(spyCall, null, 'Expected at least ' + (emailCount + 1) + ' emails sent.');

    // We increment here so that the messaging has an index of 1, whilst getting the call has an index of 0
    emailCount += 1;

    sinon.assert.called(mocks.mail);

    Object.keys(matchers).forEach((key) => {
        let value = matchers[key];

        // We use assert, rather than sinon.assert.calledWith, as we end up with much better error messaging
        assert.notEqual(spyCall.args[0][key], undefined, `Expected email to have property ${key}`);

        if (value instanceof RegExp) {
            assert.match(spyCall.args[0][key], value, `Expected Email ${emailCount} to have ${key} that matches ${value}, got ${spyCall.args[0][key]}`);
            return;
        }

        assert.equal(spyCall.args[0][key], value, `Expected Email ${emailCount} to have ${key} of ${value}`);
    });

    return spyCall.args[0];
};

/**
 * Events Mocks & Assertions
 */

const mockEvents = () => {
    mocks.events = sinon.stub(events, 'emit');
};

const emittedEvent = (name) => {
    sinon.assert.calledWith(mocks.events, name);
};

/**
 * Settings Mocks
 */

let fakedSettings = {};
const originalSettingsGetter = settingsCache.get;

const fakeSettingsGetter = (setting) => {
    if (fakedSettings.hasOwnProperty(setting)) {
        return fakedSettings[setting];
    }

    return originalSettingsGetter(setting);
};

const mockSetting = (key, value) => {
    if (!mocks.settings) {
        mocks.settings = sinon.stub(settingsCache, 'get').callsFake(fakeSettingsGetter);
    }

    fakedSettings[key] = value;
};

/**
 * Labs Mocks
 */

const fakeLabsIsSet = (flag) => {
    if (fakedLabsFlags.hasOwnProperty(flag)) {
        return fakedLabsFlags[flag];
    }

    return originalLabsIsSet(flag);
};

const mockLabsEnabled = (flag, alpha = true) => {
    // We assume we should enable alpha experiments unless explicitly told not to!
    if (!alpha) {
        configUtils.set('enableDeveloperExperiments', true);
    }

    if (!mocks.labs) {
        mocks.labs = sinon.stub(labs, 'isSet').callsFake(fakeLabsIsSet);
    }

    fakedLabsFlags[flag] = true;
};

const mockLabsDisabled = (flag, alpha = true) => {
    // We assume we should enable alpha experiments unless explicitly told not to!
    if (!alpha) {
        configUtils.set('enableDeveloperExperiments', true);
    }

    if (!mocks.labs) {
        mocks.labs = sinon.stub(labs, 'isSet').callsFake(fakeLabsIsSet);
    }

    fakedLabsFlags[flag] = false;
};

const restore = () => {
    // eslint-disable-next-line no-console
    configUtils.restore().catch(console.error);
    sinon.restore();
    mocks = {};
    fakedLabsFlags = {};
    fakedSettings = {};
    emailCount = 0;
    nock.cleanAll();
    nock.enableNetConnect();

    if (mocks.webhookMockReceiver) {
        mocks.webhookMockReceiver.reset();
    }

    mailService.GhostMailer.prototype.send = originalMailServiceSend;
};

module.exports = {
    mockEvents,
    mockMail,
    disableStripe,
    mockStripe,
    mockLabsEnabled,
    mockLabsDisabled,
    mockWebhookRequests,
    mockSetting,
    disableNetwork,
    restore,
    assert: {
        sentEmailCount,
        sentEmail,
        emittedEvent
    }
};
