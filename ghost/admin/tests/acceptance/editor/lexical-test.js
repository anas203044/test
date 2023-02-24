import loginAsRole from '../../helpers/login-as-role';
import {BLANK_DOC} from 'koenig-editor/components/koenig-editor';
import {currentURL} from '@ember/test-helpers';
import {expect} from 'chai';
import {setupApplicationTest} from 'ember-mocha';
import {setupMirage} from 'ember-cli-mirage/test-support';
import {visit} from '../../helpers/visit';

describe('Acceptance: Lexical editor', function () {
    let hooks = setupApplicationTest();
    setupMirage(hooks);

    beforeEach(async function () {
        this.server.loadFixtures();

        // ensure required config is in place for external lexical editor to load
        const config = this.server.schema.configs.find(1);
        config.attrs.editor = {url: 'https://cdn.pkg/editor.js'};
        config.save();

        // stub loaded external module to avoid loading of external dep
        window['@tryghost/koenig-lexical'] = {
            KoenigComposer: () => null,
            KoenigEditor: () => null
        };
    });

    it('redirects to signin when not authenticated', async function () {
        await visit('/lexical-editor/post/');
        expect(currentURL(), 'currentURL').to.equal('/signin');
    });

    it('redirects to posts screen if editor.url config is missing', async function () {
        const config = this.server.schema.configs.find(1);
        config.attrs.editor = undefined;
        config.save();

        await loginAsRole('Administrator', this.server);
        await visit('/lexical-editor/post/');

        expect(currentURL(), 'currentURL').to.equal('/posts');
    });

    it('loads when editor.url is present', async function () {
        await loginAsRole('Administrator', this.server);
        await visit('/lexical-editor/post/');
        expect(currentURL(), 'currentURL').to.equal('/lexical-editor/post/');
    });

    it('redirects mobiledoc editor to lexical editor when post.lexical is present', async function () {
        const post = this.server.create('post', {
            lexical: JSON.stringify({})
        });

        await loginAsRole('Administrator', this.server);
        await visit(`/editor/post/${post.id}`);

        expect(currentURL()).to.equal(`/lexical-editor/post/${post.id}`);
    });

    it('redirects lexical editor to mobiledoc editor when post.mobiledoc is present', async function () {
        const post = this.server.create('post', {
            mobiledoc: JSON.stringify(BLANK_DOC)
        });

        await loginAsRole('Administrator', this.server);
        await visit(`/lexical-editor/post/${post.id}`);

        expect(currentURL()).to.equal(`/editor/post/${post.id}`);
    });
});
