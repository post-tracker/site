import React from 'react';
import { createRoot } from 'react-dom/client';

import Ad from './components/Ad.jsx';
import Root from './components/Root.jsx';

// Mount only the ad slots that apply to the current viewport — never all of
// them. `adsbygoogle.push({})` is not bound to a specific <ins>: each push
// fills the next *unprocessed* <ins> in DOM order, page-wide. The side rails
// collapse to zero width below 1480px (their inline left/right offsets cross
// over), but their <ins> elements stay in the DOM ahead of the footer. A push
// then lands on a zero-width rail first — "No slot size for availableWidth=0" —
// and the batch aborts before reaching the footer, so the footer never fills.
// Keeping the hidden side's <ins> out of the DOM entirely is the only reliable
// fix. Read once at load (matching the SCSS breakpoint); a rotate/resize across
// the breakpoint re-picks on the next reload, which is standard for ad units.
const isNarrow = window.matchMedia && window.matchMedia( '( max-width: 1480px )' ).matches;

if ( isNarrow ) {
    // Phones/tablets: the rails are hidden, so the only ad is a sticky footer
    // banner. A *fixed* 320x50 unit, not a responsive one: responsive
    // `horizontal` let AdSense resolve the slot to the 320x100 large mobile
    // banner on a phone (twice the height we want for a sticky bar). Passing a
    // falsy dataAdFormat opts out of the responsive path in Ad.jsx, so the
    // explicit 320x50 in `styles` is the served size — a thin line, fixed height.
    const FOOTER_AD_SLOT = '3651963216';
    const footerAdContainer = document.getElementById( 'footer-ad' );
    const footerAdRoot = createRoot(footerAdContainer);
    footerAdRoot.render(<Ad
        dataAdSlot = { FOOTER_AD_SLOT }
        dataAdFormat = { '' }
        styles = { {
            display: 'inline-block',
            height: '50px',
            width: '320px',
        } }
    />);
} else {
    // Desktop: the centered container leaves a gap on each side wide enough for
    // a responsive rail unit; the footer stays hidden.
    const ad1Container = document.getElementById( 'left-ad' );
    const ad1Root = createRoot(ad1Container);
    ad1Root.render(<Ad
        dataAdSlot = { '9422842819' }
    />);

    const ad2Container = document.getElementById( 'right-ad' );
    const ad2Root = createRoot(ad2Container);
    ad2Root.render(<Ad
        dataAdSlot = { '7806508818' }
    />);
}

const pageContainer = document.getElementById( 'js-app' );
const pageRoot = createRoot(pageContainer);
pageRoot.render(<Root />);