import React from 'react';
import { createRoot } from 'react-dom/client';

import Ad from './components/Ad.jsx';
import Root from './components/Root.jsx';

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

// Mobile-only footer ad. The side rails above are hidden below 1480px (see
// _styles.scss), so phones/tablets otherwise see no ad — this fills that gap.
// Rendered as a fixed 320x50 banner (no format) so it stays a thin line rather
// than a tall responsive block.
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

const pageContainer = document.getElementById( 'js-app' );
const pageRoot = createRoot(pageContainer);
pageRoot.render(<Root />);