const should = require('should');
const sinon = require('sinon');
const labs = require('../../../../../core/shared/labs');

const {getSegmentsFromHtml} = require('../../../../../core/server/services/mega/segment-parser');

describe('MEGA: Segment Parser', function () {
    afterEach(function () {
        sinon.restore();
    });

    it('extracts a single segments used in HTML', function () {
        const html = '<div data-gh-segment="status:-free"><p>Plain html with no replacements</p></div>';

        const segments = getSegmentsFromHtml(html);

        segments.length.should.equal(1);
        segments[0].should.equal('status:-free');
    });

    it('extracts multiple segments used in HTML', function () {
        const html = `
            <div data-gh-segment="status:-free"><p>Text for paid</p></div>
            <div data-gh-segment="status:free"><p>Text for free</p></div>
            <div data-gh-segment="status:-free,label.slug:VIP"><p>Text for paid VIP</p></div>
        `;

        const segments = getSegmentsFromHtml(html);

        segments.length.should.equal(3);
        segments[0].should.equal('status:-free');
        segments[1].should.equal('status:free');
        segments[2].should.equal('status:-free,label.slug:VIP');
    });

    it('extracts only unique segments', function () {
        const html = `
            <div data-gh-segment="status:-free"><p>Text for paid</p></div>
            <div data-gh-segment="status:free"><p>Text for free</p></div>
            <div data-gh-segment="status:-free"><p>Another message for paid member</p></div>
        `;

        const segments = getSegmentsFromHtml(html);

        segments.length.should.equal(2);
        segments[0].should.equal('status:-free');
        segments[1].should.equal('status:free');
    });

    it('extracts all segments for paywalled content', function () {
        sinon.stub(labs, 'isSet').returns(true);

        const html = '<p>Free content</p><!--members-only--><p>Members content</p>';

        const segments = getSegmentsFromHtml(html);

        segments.length.should.equal(2);
        segments[0].should.equal('status:free');
        segments[1].should.equal('status:-free');
    });

    it('extracts all unique segments including paywalled content', function () {
        sinon.stub(labs, 'isSet').returns(true);
        const html = `
            <div data-gh-segment="status:-free"><p>Text for paid</p></div>
            <div data-gh-segment="status:free"><p>Text for free</p></div>
            <div data-gh-segment="status:-free"><p>Another message for paid member</p></div>
            <p>Free content</p><!--members-only--><p>Members content</p>
        `;

        const segments = getSegmentsFromHtml(html);

        segments.length.should.equal(2);
        segments[0].should.equal('status:-free');
        segments[1].should.equal('status:free');
    });

    it('extracts no segments from HTML', function () {
        const html = '<div data-gh-somethingelse="status:-free"><p>Plain html with no replacements</p></div>';

        const segments = getSegmentsFromHtml(html);

        segments.length.should.equal(0);
    });
});
