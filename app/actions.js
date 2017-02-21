import https from 'https';
import queryString from 'query-string';
import debounce from 'debounce';

export const TOGGLE_GROUP = 'TOGGLE_GROUP';
export const RECEIVE_GROUPS = 'RECEIVE_GROUPS';
export const REQUEST_POSTS = 'REQUEST_POSTS';
export const RECEIVE_POSTS = 'RECEIVE_POSTS';
export const SET_SEARCH_TERM = 'SET_SEARCH_TERM';

const DATA_URL = 'data';
const FETCH_DEBOUNCE_INTERVAL = 250;

const setSearchTerm = function setSearchTerm ( term ) {
    return {
        term,
        type: SET_SEARCH_TERM,
    };
};

const receivePosts = function receivePosts ( json ) {
    return {
        posts: json,
        receivedAt: Date.now(),
        type: RECEIVE_POSTS,
    };
};

const receiveGroups = function receiveGroups ( json ) {
    return {
        items: json,
        type: RECEIVE_GROUPS,
    };
};

const toggleGroupState = function toggleGroupState ( name ) {
    return {
        name,
        type: TOGGLE_GROUP,
    };
};

const fetchGroups = function fetchGroups () {
    return ( dispatch ) => {
        const options = {
            hostname: window.location.hostname,
            method: 'GET',
            path: `${ window.location.pathname }${ DATA_URL }?type=groups`,
        };

        if ( window.location.port ) {
            options.port = window.location.port;
        }

        const request = https.request( options, ( response ) => {
            let body = '';

            response.setEncoding( 'utf8' );

            response.on( 'data', ( chunk ) => {
                body = body + chunk;
            } );

            response.on( 'end', () => {
                let groups = JSON.parse( body );

                // If we only have one group, treat it as no group
                if ( groups.length === 1 ) {
                    groups = [];
                }

                // Transform group names to objects
                groups = groups.map( ( name ) => {
                    return {
                        active: false,
                        name: name,
                    };
                } );

                dispatch( receiveGroups( groups ) );
            } );
        } );

        request.on( 'error', ( requestError ) => {
            // eslint-disable-next-line no-console
            console.log( `problem with request: ${ requestError.message }` );
        } );

        request.end();
    };
};

const getPosts = function getPosts ( search, groups, dispatch ) {
    const querystringParameters = {};
    const options = {
        hostname: window.location.hostname,
        method: 'GET',
        path: `${ window.location.pathname }${ DATA_URL }`,
    };
    const activeGroups = groups.items.filter( ( group ) => {
        return group.active;
    } );

    if ( window.location.port ) {
        options.port = window.location.port;
    }

    if ( typeof search !== 'undefined' && search.length > 0 ) {
        querystringParameters.search = search;
        querystringParameters.type = 'search';
    }

    if ( activeGroups && activeGroups.length > 0 ) {
        querystringParameters[ 'groups[]' ] = activeGroups.map( ( group ) => {
            return group.name;
        } );
    }

    const parsedQuerystring = queryString.stringify( querystringParameters );

    if ( parsedQuerystring.length > 0 ) {
        options.path = `${ options.path }?${ parsedQuerystring }`;
    }

    if ( parsedQuerystring.length > 0 ) {
        const locationSearch = `?${ parsedQuerystring }`;

        if ( window.location.search !== locationSearch ) {
            window.history.pushState( {}, search, locationSearch );
        }
    } else {
        window.history.pushState( {}, search, window.location.pathname );
    }

    const request = https.request( options, ( response ) => {
        let body = '';

        response.setEncoding( 'utf8' );

        response.on( 'data', ( chunk ) => {
            body = body + chunk;
        } );

        response.on( 'end', () => {
            dispatch( receivePosts( JSON.parse( body ) ) );
        } );
    } );

    request.on( 'error', ( requestError ) => {
        // eslint-disable-next-line no-console
        console.log( `problem with request: ${ requestError.message }` );
    } );

    request.end();
};

const debouncedFetchPosts = debounce( getPosts, FETCH_DEBOUNCE_INTERVAL );

const fetchPosts = function fetchPosts ( state ) {
    const {
        search,
        groups,
     } = state;

    return ( dispatch ) => {
        debouncedFetchPosts( search, groups, dispatch );
    };
};

const fetchPostsImmediate = function fetchPostsImmediate ( state ) {
    const {
        search,
        groups,
     } = state;

    return ( dispatch ) => {
        getPosts( search, groups, dispatch );
    };
};

export const fetchPostsIfNeeded = function fetchPostsIfNeeded () {
    return ( dispatch, getState ) => {
        return dispatch( fetchPosts( getState() ) );
    };
};

export const search = function search ( searchTerm ) {
    return ( dispatch, getState ) => {
        dispatch( setSearchTerm( searchTerm ) );

        return dispatch( fetchPosts( getState() ) );
    };
};

export const getGroups = function getGroups () {
    return ( dispatch ) => {
        return dispatch( fetchGroups() );
    };
};

export const toggleGroup = function toggleGroup ( name ) {
    return ( dispatch, getState ) => {
        dispatch( toggleGroupState( name ) );

        return dispatch( fetchPostsImmediate( getState() ) );
    };
};
