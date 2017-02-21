import React from 'react';
import { connect } from 'react-redux';

import {
    fetchPostsIfNeeded,
} from '../actions';

import PostList from '../components/PostList.jsx';

class PostListContainer extends React.Component {
    componentDidMount () {
        this.props.getPosts();
    }

    render () {
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
    getPosts: React.PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    posts: React.PropTypes.array.isRequired,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)( PostListContainer );
