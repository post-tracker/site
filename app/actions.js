import https from 'https';
import queryString from 'query-string';
import debounce from 'debounce';
import cookie from 'react-cookie';

export const TOGGLE_GROUP = 'TOGGLE_GROUP';
export const RECEIVE_GROUPS = 'RECEIVE_GROUPS';
export const REQUEST_POSTS = 'REQUEST_POSTS';
export const RECEIVE_POSTS = 'RECEIVE_POSTS';
export const SET_SEARCH_TERM = 'SET_SEARCH_TERM';
export const TOGGLE_SERVICE = 'TOGGLE_SERVICE';
export const RECEIVE_SERVICES = 'RECEIVE_SERVICES';

const FETCH_DEBOUNCE_INTERVAL = 250;
let API_HOSTNAME = 'api.kokarn.com';
let API_PORT = 443;

if ( window.location.hostname === 'localhost' ) {
    API_HOSTNAME = 'lvh.me';
    // eslint-disable-next-line no-magic-numbers
    API_PORT = 3000;
}

const setSearchTerm = function setSearchTerm ( term ) {
    const currentQuery = queryString.parse( location.search );

    if ( currentQuery.post ) {
        Reflect.deleteProperty( currentQuery, 'post' );
        let newPath = queryString.stringify( currentQuery );

        if ( newPath.length > 0 ) {
            newPath = `?${ newPath }`;
        } else {
            newPath = window.location.origin + window.location.pathname;
        }

        window.history.pushState( {}, '', newPath );
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

const receiveServices = function receiveServices ( json ) {
    return {
        items: json,
        type: RECEIVE_SERVICES,
    };
};

const toggleServiceState = function toggleServiceState ( name ) {
    return {
        name,
        type: TOGGLE_SERVICE,
    };
};

const fetchServices = function fetchServices () {
    return ( dispatch ) => {
        const options = {
            hostname: API_HOSTNAME,
            method: 'GET',
            path: `/${ window.game }/services`,
            port: API_PORT,
        };

        const request = https.request( options, ( response ) => {
            let body = '';

            response.setEncoding( 'utf8' );

            response.on( 'data', ( chunk ) => {
                body = body + chunk;
            } );

            response.on( 'end', () => {
                let services = JSON.parse( body ).data;

                // If we only have one group, treat it as no group
                if ( services.length === 1 ) {
                    services = [];
                }

                // Transform group names to objects
                services = services.map( ( name ) => {
                    return {
                        active: true,
                        name: name,
                    };
                } );

                dispatch( receiveServices( services ) );
            } );
        } );

        request.on( 'error', ( requestError ) => {
            // eslint-disable-next-line no-console
            console.log( `problem with request: ${ requestError.message }` );
        } );

        request.end();
    };
};

const fetchGroups = function fetchGroups () {
    return ( dispatch ) => {
        const options = {
            hostname: API_HOSTNAME,
            method: 'GET',
            path: `/${ window.game }/groups`,
            port: API_PORT,
        };

        const request = https.request( options, ( response ) => {
            let body = '';

            response.setEncoding( 'utf8' );

            response.on( 'data', ( chunk ) => {
                body = body + chunk;
            } );

            response.on( 'end', () => {
                let groups = JSON.parse( body ).data;

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

    if ( activeGroups && activeGroups.length > 0 ) {
        querystringParameters[ 'groups[]' ] = activeGroups.map( ( group ) => {
            return group.name;
        } );
    }

    if ( activeServices && activeServices.length > 0 && activeServices.length !== services.items.length ) {
        querystringParameters[ 'services[]' ] = activeServices.map( ( service ) => {
            return service.name;
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

        if ( window.location.search !== locationSearch ) {
            window.history.pushState( {}, search, locationSearch );
        }
    } else {
        window.history.pushState( {}, search, window.location.pathname );
    }

    const cookieServices = cookie.load( 'services' );

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

    const request = https.request( options, ( response ) => {
        let body = '';

        response.setEncoding( 'utf8' );

        response.on( 'data', ( chunk ) => {
            body = body + chunk;
        } );

        response.on( 'end', () => {
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

export const getServices = function getServices () {
    return ( dispatch ) => {
        return dispatch( fetchServices() );
    };
};

export const toggleService = function toggleService ( name ) {
    return ( dispatch, getState ) => {
        dispatch( toggleServiceState( name ) );

        return dispatch( fetchPostsImmediate( getState() ) );
    };
};
