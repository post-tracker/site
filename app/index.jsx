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

const pageContainer = document.getElementById( 'js-app' );
const pageRoot = createRoot(pageContainer);
pageRoot.render(<Root />);