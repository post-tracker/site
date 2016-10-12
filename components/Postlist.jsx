import http from 'http';

import React from 'react';
import debounce from 'debounce';
import Hashes from 'jshashes';
import queryString from 'query-string';

import Post from './Post.jsx';
import Search from './Search.jsx';
import Loader from './Loader.jsx';

const DEFAULT_DATA_PORT = 80;
const SEARCH_DEBOUNCE_INTERVAL = 350;
const POLL_INTERVAL = 60000;
const DATA_URL = 'actions/data.php';

class PostList extends React.Component {
    constructor ( props ) {
        super( props );

        const defaultState = {
            loading: true,
            posts: [],
            searchGroups: [],
            searchString: '',
        };

        const currentQuery = queryString.parse( location.search );

        if ( typeof currentQuery.search !== 'undefined' ) {
            defaultState.searchString = currentQuery.search;
        }

        if ( typeof currentQuery[ 'groups[]' ] !== 'undefined' ) {
            let groups = currentQuery[ 'groups[]' ];

            if ( typeof groups !== 'object' ) {
                groups = [ groups ];
            }

            defaultState.searchGroups = groups;
        }

        this.onSearch = this.onSearch.bind( this );

        this.updateDataTimeout = false;

        this.state = defaultState;
    }

    componentWillMount () {
        this.debouncedSearch = debounce( this.loadCommentsFromServer, SEARCH_DEBOUNCE_INTERVAL );
    }

    componentDidMount () {
        this.loadCommentsFromServer();

        this.setUpdateTimeout();
    }

    setUpdateTimeout () {
        this.updateDataTimeout = setTimeout( this.loadCommentsFromServer.bind( this ), POLL_INTERVAL );
    }

    onSearch ( searchString, groups ) {
        this.debouncedSearch( searchString, groups );
    }

    loadCommentsFromServer ( searchString, groups ) {
        clearTimeout( this.updateDataTimeout );

        const options = {
            hostname: window.location.hostname,
            method: 'GET',
            path: `${ window.location.pathname }${ DATA_URL }`,
            port: window.location.port || DEFAULT_DATA_PORT,
        };

        if ( typeof searchString === 'undefined' ) {
            searchString = this.state.searchString;
        }

        if ( typeof groups === 'undefined' ) {
            groups = this.state.searchGroups;
        }

        const querystringParameters = {};

        if ( typeof searchString !== 'undefined' && searchString.length > 0 ) {
            querystringParameters.search = searchString;
            querystringParameters.type = 'search';
        }

        if ( groups && groups.length > 0 ) {
            querystringParameters[ 'groups[]' ] = groups;
        }

        const parsedQuerystring = queryString.stringify( querystringParameters );

        if ( parsedQuerystring.length > 0 ) {
            options.path = `${ options.path }?${ parsedQuerystring }`;
        }

        if ( parsedQuerystring.length > 0 ) {
            const locationSearch = `?${ parsedQuerystring }`;

            if ( window.location.search !== locationSearch ) {
                window.history.pushState( {}, searchString, locationSearch );
            }
        } else {
            window.history.pushState( {}, searchString, window.location.pathname );
        }

        const request = http.request( options, ( response ) => {
            let body = '';

            response.setEncoding( 'utf8' );

            response.on( 'data', ( chunk ) => {
                body = body + chunk;
            } );

            response.on( 'end', () => {
                this.setState( {
                    loading: false,
                    posts: JSON.parse( body ),
                    searchGroups: groups,
                    searchString: searchString,
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
        let postNodes = [];

        if ( this.state.loading ) {
            postNodes.push( <Loader /> );
        } else {
            postNodes = this.state.posts.map( ( communityPost ) => {
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
        }

        return (
            <div>
                <Search
                    handleSearch = { this.onSearch }
                    url = { `${ DATA_URL }?type=groups` }
                />
                { postNodes }
            </div>
        );
    }
}

export default PostList;
