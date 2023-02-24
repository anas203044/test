// Order matters! Ordered so that dependant tables are after their dependencies
module.exports = {
    NewslettersImporter: require('./newsletters'),
    PostsImporter: require('./posts'),
    UsersImporter: require('./users'),
    TagsImporter: require('./tags'),
    ProductsImporter: require('./products'),
    MembersImporter: require('./members'),
    BenefitsImporter: require('./benefits'),
    MentionsImporter: require('./mentions'),
    PostsAuthorsImporter: require('./posts-authors'),
    PostsTagsImporter: require('./posts-tags'),
    ProductsBenefitsImporter: require('./products-benefits'),
    MembersProductsImporter: require('./members-products'),
    PostsProductsImporter: require('./posts-products'),
    MembersNewslettersImporter: require('./members-newsletters'),
    StripeProductsImporter: require('./stripe-products'),
    StripePricesImporter: require('./stripe-prices'),
    SubscriptionsImporter: require('./subscriptions'),
    EmailsImporter: require('./emails'),
    MembersCreatedEventsImporter: require('./members-created-events'),
    MembersLoginEventsImporter: require('./members-login-events'),
    MembersStatusEventsImporter: require('./members-status-events'),
    MembersStripeCustomersImporter: require('./members-stripe-customers'),
    MembersStripeCustomersSubscriptionsImporter: require('./members-stripe-customers-subscriptions'),
    MembersPaidSubscriptionEventsImporter: require('./members-paid-subscription-events'),
    MembersSubscriptionCreatedEventsImporter: require('./members-subscription-created-events'),
    MembersSubscribeEventsImporter: require('./members-subscribe-events'),
    EmailBatchesImporter: require('./email-batches'),
    EmailRecipientsImporter: require('./email-recipients'),
    RedirectsImporter: require('./redirects'),
    MembersClickEventsImporter: require('./members-click-events'),
    OffersImporter: require('./offers'),
    LabelsImporter: require('./labels'),
    MembersLabelsImporter: require('./members-labels'),
    RolesUsersImporter: require('./roles-users')
};
