import https from 'https';
import queryString from 'query-string';
import debounce from 'debounce';
import cookie from 'react-cookie';

export const TOGGLE_GROUP = 'TOGGLE_GROUP';
export const REQUEST_POSTS = 'REQUEST_POSTS';
export const RECEIVE_POSTS = 'RECEIVE_POSTS';
export const SET_SEARCH_TERM = 'SET_SEARCH_TERM';
export const TOGGLE_SERVICE = 'TOGGLE_SERVICE';

const FETCH_DEBOUNCE_INTERVAL = 250;
let API_HOSTNAME = 'api.developertracker.com';
let API_PORT = 443;
let trackTiming = true;

if ( window.location.hostname === 'localhost' ) {
    API_HOSTNAME = 'lvh.me';
    // eslint-disable-next-line no-magic-numbers
    API_PORT = 3000;
}

const setSearchTerm = function setSearchTerm ( term ) {
    const currentQuery = queryString.parse( location.search );

    if ( currentQuery.post ) {
        // Bad browser support
        // Reflect.deleteProperty( currentQuery, 'post' );
        delete currentQuery.post;
        
        let newPath = queryString.stringify( currentQuery );

        if ( newPath.length > 0 ) {
            newPath = `?${ newPath }`;
        } else {
            newPath = window.location.origin + window.location.pathname;
        }

        if ( window.history.pushState ) {
            window.history.pushState( {}, '', newPath );
        }
    }

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

const toggleGroupState = function toggleGroupState ( name ) {
    return {
        name,
        type: TOGGLE_GROUP,
    };
};

const toggleServiceState = function toggleServiceState ( name ) {
    return {
        name,
        type: TOGGLE_SERVICE,
    };
};

// eslint-disable-next-line max-params
const getPosts = function getPosts ( search, groups, services, dispatch ) {
    let querystringParameters = {};
    const options = {
        hostname: API_HOSTNAME,
        method: 'GET',
        path: `/${ window.game }/posts`,
        port: API_PORT,
    };
    const activeGroups = groups.items.filter( ( group ) => {
        return group.active;
    } );

    let activeServices = [];

    activeServices = services.items.filter( ( service ) => {
        return service.active;
    } );

    if ( typeof search !== 'undefined' && search.length > 0 ) {
        querystringParameters.search = search;
    }

    if ( activeGroups && activeGroups.length > 0 && activeGroups.length !== groups.items.length ) {
        querystringParameters[ 'groups[]' ] = activeGroups.map( ( group ) => {
            return group.name;
        } );
    }

    const currentQuery = queryString.parse( location.search );

    // If we have a post, don't keep anything else in the querystring
    if ( currentQuery.post ) {
        querystringParameters = {
            post: currentQuery.post,
        };
    }

    let parsedQuerystring = queryString.stringify( querystringParameters );

    if ( parsedQuerystring.length > 0 ) {
        const locationSearch = `?${ parsedQuerystring }`;

        if ( window.location.search !== locationSearch && window.history.pushState ) {
            window.history.pushState( {}, search, locationSearch );
        }
    } else {
        if ( window.history.pushState ) {
            window.history.pushState( {}, search, window.location.pathname );
        }
    }

    const cookieServices = cookie.load( 'services' );

    if ( activeServices && activeServices.length > 0 && activeServices.length !== services.items.length ) {
        querystringParameters[ 'services[]' ] = activeServices.map( ( service ) => {
            return service.name;
        } );

        parsedQuerystring = queryString.stringify( querystringParameters );
    }

    if ( services.items.length === 0 && cookieServices && !currentQuery.post ) {
        querystringParameters[ 'services[]' ] = cookieServices;
        parsedQuerystring = queryString.stringify( querystringParameters );
    }

    if ( parsedQuerystring.length > 0 ) {
        if ( querystringParameters.post ) {
            options.path = `${ options.path }/${ querystringParameters.post }`;
        } else {
            options.path = `${ options.path }?${ parsedQuerystring }`;
        }
    }

    const startTime = new Date().getTime();

    const request = https.request( options, ( response ) => {
        let body = '';

        response.setEncoding( 'utf8' );

        response.on( 'data', ( chunk ) => {
            body = body + chunk;
        } );

        response.on( 'end', () => {
            if ( window.ga && trackTiming ) {
                ga( 'send', {
                    hitType: 'timing',
                    timingCategory: 'Posts API',
                    timingVar: 'load',
                    timingValue: new Date().getTime() - startTime,
                    timingLabel: options.path,
                } );
            }
            dispatch( receivePosts( JSON.parse( body ).data ) );
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
        services,
     } = state;

    return ( dispatch ) => {
        debouncedFetchPosts( search, groups, services, dispatch );
    };
};

const fetchPostsImmediate = function fetchPostsImmediate ( state ) {
    const {
        search,
        groups,
        services,
     } = state;

    return ( dispatch ) => {
        getPosts( search, groups, services, dispatch );
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

export const toggleGroup = function toggleGroup ( name ) {
    return ( dispatch, getState ) => {
        dispatch( toggleGroupState( name ) );

        return dispatch( fetchPostsImmediate( getState() ) );
    };
};

export const toggleService = function toggleService ( name ) {
    return ( dispatch, getState ) => {
        dispatch( toggleServiceState( name ) );

        return dispatch( fetchPostsImmediate( getState() ) );
    };
};
