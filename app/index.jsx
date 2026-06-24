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
    // banner. Responsive `horizontal` with full-width-responsive off, so AdSense
    // serves a standard banner (320x50 on a phone) — a thin line, not a tall
    // block — while still measuring the full-width container.
    const FOOTER_AD_SLOT = '3651963216';
    const footerAdContainer = document.getElementById( 'footer-ad' );
    const footerAdRoot = createRoot(footerAdContainer);
    footerAdRoot.render(<Ad
        dataAdSlot = { FOOTER_AD_SLOT }
        dataAdFormat = { 'horizontal' }
        dataFullWidthResponsive = { 'false' }
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