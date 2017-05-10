import React from 'react';
import { render } from 'react-dom';

import Ad from './components/Ad.jsx';

render(
    <Ad
        dataAdSlot = { '9422842819' }
    />,
    document.getElementById( 'left-ad' )
);

render(
    <Ad
        dataAdSlot = { '7806508818' }
    />,
    document.getElementById( 'right-ad' )
);
