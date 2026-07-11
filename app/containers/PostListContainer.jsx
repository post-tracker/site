import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    fetchPostsIfNeeded,
} from '../actions';

import { getUnreadMap, commitSeen } from '../unread';

import PostList from '../components/PostList.jsx';
import Skeleton from '../components/Skeleton.jsx';
import NoPosts from '../components/NoPosts.jsx';

class PostListContainer extends React.Component {
    componentDidMount () {
        this.props.getPosts();
        commitSeen( this.props.posts );
    }

    componentDidUpdate ( previousProps ) {
        // Advance the watermark + app badge whenever a new set of posts lands
        // (initial load, search, filter/service change). The unread markers
        // shown this render are still based on the session baseline captured
        // before this call, so flagged posts stay flagged for the visit.
        if ( previousProps.posts !== this.props.posts ) {
            commitSeen( this.props.posts );
        }
    }

    render () {
        // Show skeleton placeholders whenever we're fetching — the initial load
        // as well as searches, filter and service changes. The fetch on search
        // is debounced, so isFetching only flips once the request actually
        // starts, not on every keystroke.
        if ( this.props.isFetching ) {
            return (
                <Skeleton />
            );
        }

        if ( this.props.posts.length < 1 ) {
            return (
                <NoPosts
                    show = { ( !this.props.posts.length && !this.props.isFetching ) }
                    query = { this.props.searchString }
                />
            );
        }

        return (
            <PostList
                posts = { this.props.posts }
                unread = { getUnreadMap( this.props.posts ) }
            />
        );
    }
}

const mapStateToProps = function mapStateToProps ( state ) {
    const {
        posts,
        search,
    } = state;

    return {
        isFetching: posts.isFetching,
        posts: posts.items || [],
        searchString: search,
    };
};

const mapDispatchToProps = ( dispatch ) => {
    return {
        getPosts: () => {
            dispatch( fetchPostsIfNeeded() );
        },
    };
};

PostListContainer.propTypes = {
    isFetching: PropTypes.bool.isRequired,
    getPosts: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    posts: PropTypes.array.isRequired,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)( PostListContainer );
