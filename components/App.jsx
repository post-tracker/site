import React from 'react';
import ReactDOM from 'react-dom';
import Postlist from './Postlist.jsx';

ReactDOM.render(
    <Postlist
        pollInterval = { 60000 }
        url = { 'actions/data.php' }
    />,
    document.getElementById( 'js-app' )
);
