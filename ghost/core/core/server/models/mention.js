const ghostBookshelf = require('./base');

const Mention = ghostBookshelf.Model.extend({
    tableName: 'mentions',
    defaults: {
        deleted: false,
        verified: false
    },
    enforcedFilters() {
        return 'deleted:false';
    }
});

module.exports = {
    Mention: ghostBookshelf.model('Mention', Mention)
};
