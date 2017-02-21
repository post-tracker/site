import React from 'react';
import Hashes from 'jshashes';

import Post from './Post.jsx';

class PostList extends React.Component {
    render () {
        const addedHashes = [];
        let postNodes = [];

        postNodes = this.props.posts.map( ( communityPost ) => {
            const hash = new Hashes.MD5().hex( `${ communityPost.author }${ communityPost.timestamp }${ communityPost.content }` );

            // TODO: Fix so we don't add duplicates to the database
            if ( addedHashes.indexOf( hash ) > -1 ) {
                return false;
            }

            addedHashes.push( hash );

            return (
                <Post
                    key = { hash }
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
    posts: React.PropTypes.array.isRequired,
};

export default PostList;
