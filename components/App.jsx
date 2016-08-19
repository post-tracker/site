import React from 'react';
import ReactDOM from 'react-dom';
import Postlist from './Postlist.jsx';

ReactDOM.render(
    <Postlist
        url="actions/data.php"
        pollInterval = { 60000 }
    />,
    document.getElementById( 'js-app' )
);
