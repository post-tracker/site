import React from 'react';

import PostListContainer from '../containers/PostListContainer.jsx';
import Search from '../containers/Search.jsx';
import GroupsContainer from '../containers/GroupsContainer.jsx';

class App extends React.Component {
    render () {
        return (
            <div>
                <Search />
                <GroupsContainer />
                <PostListContainer />
            </div>
        );
    }
}

export default App;
