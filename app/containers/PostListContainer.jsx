import React from 'react';
import { connect } from 'react-redux';

import {
    fetchPostsIfNeeded,
} from '../actions';

import PostList from '../components/PostList.jsx';
import Loader from '../components/Loader.jsx';
import NoPosts from '../components/NoPosts.jsx';

class PostListContainer extends React.Component {
    componentDidMount () {
        this.props.getPosts();
    }

    render () {
        if ( this.props.isFetching ) {
            return (
                <Loader />
            );
        }

        if ( this.props.posts.length < 1 ) {
            return (
                <NoPosts />
            );
        }

        return (
            <PostList
                posts = { this.props.posts }
            />
        );
    }
}

const mapStateToProps = function mapStateToProps ( state ) {
    const {
        posts,
    } = state;

    return {
        isFetching: posts.isFetching,
        posts: posts.items || [],
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
    isFetching: React.PropTypes.bool.isRequired,
    getPosts: React.PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    posts: React.PropTypes.array.isRequired,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)( PostListContainer );
