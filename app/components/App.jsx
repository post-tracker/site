import React from 'react';

import PostListContainer from '../containers/PostListContainer.jsx';
import FiltersContainer from '../containers/FiltersContainer.jsx';

class App extends React.Component {
    render () {
        return (
            <div>
                <FiltersContainer />
                <PostListContainer />
            </div>
        );
    }
}

export default App;
