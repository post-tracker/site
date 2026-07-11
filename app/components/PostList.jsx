import React from 'react';
import PropTypes from 'prop-types';

import Post from './Post.jsx';
import Ad from './Ad.jsx';

// In-feed ad placed after the Nth post (desktop + mobile). Only injected when
// the feed is longer than that, so short feeds don't end on an ad.
const IN_FEED_AD_SLOT = '3885153111';
const IN_FEED_AD_AFTER = 3;

class PostList extends React.Component {
    render () {
        const postNodes = [];

        this.props.posts.forEach( ( communityPost, index ) => {
            postNodes.push(
                <Post
                    key = { communityPost.urlHash }
                    postData = { communityPost }
                    postIndex = { index }
                    isNew = { Boolean( this.props.unread[ communityPost.urlHash ] ) }
                />
            );

            if ( index + 1 === IN_FEED_AD_AFTER && this.props.posts.length > IN_FEED_AD_AFTER ) {
                postNodes.push(
                    <div
                        className = { 'in-feed-ad' }
                        key = { 'in-feed-ad' }
                    >
                        <Ad
                            dataAdSlot = { IN_FEED_AD_SLOT }
                        />
                    </div>
                );
            }
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
    // eslint-disable-next-line react/forbid-prop-types
    unread: PropTypes.object,
};

PostList.defaultProps = {
    unread: {},
};

export default PostList;
