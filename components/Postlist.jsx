import http from 'http';

import React from 'react';
import debounce from 'debounce';
import Hashes from 'jshashes';
import queryString from 'query-string';

import Post from './Post.jsx';
import Search from './Search.jsx';

const DEFAULT_DATA_PORT = 80;
const SEARCH_DEBOUNCE_INTERVAL = 250;
const POLL_INTERVAL = 60000;
const DATA_URL = 'actions/data.php';

class PostList extends React.Component {
    constructor ( props ) {
        super( props );

        const defaultState = {
            posts: [],
            searchString: '',
        };

        const currentQuery = queryString.parse( location.search );

        if ( typeof currentQuery.search !== 'undefined' ) {
            defaultState.searchString = currentQuery.search;
        }

        this.onSearch = this.onSearch.bind( this );

        this.updateDataTimeout = false;

        this.state = defaultState;
    }

    componentWillMount () {
        this.debouncedSearch = debounce( this.search, SEARCH_DEBOUNCE_INTERVAL );
    }

    componentDidMount () {
        if ( this.state.searchString.length > 0 ) {
            this.loadCommentsFromServer( this.state.searchString );
        } else {
            this.loadCommentsFromServer();
        }

        this.setUpdateTimeout();
    }

    setUpdateTimeout () {
        this.updateDataTimeout = setTimeout( this.loadCommentsFromServer.bind( this ), this.props.pollInterval );
    }

    onSearch ( searchString ) {
        this.debouncedSearch( searchString );
    }

    search ( searchString ) {
        this.setState( {
            searchString: searchString,
        } );

        if ( searchString.length > 0 ) {
            window.history.pushState( {}, searchString, `?search=${ searchString }` );
        } else {
            window.history.pushState( {}, searchString, window.location.pathname );
        }

        this.loadCommentsFromServer( searchString );
    }

    loadCommentsFromServer ( searchString ) {
        clearTimeout( this.updateDataTimeout );

        const options = {
            hostname: window.location.hostname,
            method: 'GET',
            path: `${ window.location.pathname }${ DATA_URL }`,
            port: window.location.port || DEFAULT_DATA_PORT,
        };

        if ( typeof searchString !== 'undefined' ) {
            // This happends the first time
            options.path = `${ options.path }?search=${ searchString }`;
        } else if ( this.state.searchString.length > 0 ) {
            // This happends when we load posts again after some time
            options.path = `${ options.path }?search=${ this.state.searchString }`;
        }

        const request = http.request( options, ( response ) => {
            let body = '';

            response.setEncoding( 'utf8' );

            response.on( 'data', ( chunk ) => {
                body = body + chunk;
            } );

            response.on( 'end', () => {
                this.setState( {
                    posts: JSON.parse( body ),
                } );
            } );

            this.setUpdateTimeout();
        } );

        request.on( 'error', ( requestError ) => {
            // eslint-disable-next-line no-console
            console.log( `problem with request: ${ requestError.message }` );
        } );

        request.end();
    }

    render () {
        const addedHashes = [];

        const postNodes = this.state.posts.map( ( communityPost ) => {
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
                <Search
                    handleSearch = { this.onSearch }
                />
                { postNodes }
            </div>
        );
    }
}

export default PostList;
