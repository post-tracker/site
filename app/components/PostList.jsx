import React from 'react';
import PropTypes from 'prop-types';

import Post from './Post.jsx';

class PostList extends React.Component {
    render () {
        let postNodes = [];

        postNodes = this.props.posts.map( ( communityPost ) => {
            return (
                <Post
                    key = { communityPost.urlHash }
                    postData = { communityPost }
                />
            );
        } );

        return (
            <div>
                { postNodes }
            </div>
        );
    }
}

PostList.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    posts: PropTypes.array.isRequired,
};

export default PostList;
