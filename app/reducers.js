import { combineReducers } from 'redux';
import queryString from 'query-string';
import cookie from 'react-cookie';

import {
    RECEIVE_GROUPS,
    RECEIVE_POSTS,
    REQUEST_POSTS,
    SET_SEARCH_TERM,
    TOGGLE_GROUP,
    RECEIVE_SERVICES,
    TOGGLE_SERVICE,
} from './actions';

const groups = function groups ( state = {
    items: [],
}, action ) {
    let updatedItems;
    const currentQuery = queryString.parse( location.search );

    if ( typeof currentQuery[ 'groups[]' ] === 'string' ) {
        currentQuery[ 'groups[]' ] = [ currentQuery[ 'groups[]' ] ];
    }

    switch ( action.type ) {
        case TOGGLE_GROUP:
            if ( action.name === 'All' ) {
                updatedItems = state.items.map( ( group ) => {
                    group.active = false;

                    return group;
                } );
            } else {
                updatedItems = state.items.map( ( group ) => {
                    if ( group.name === action.name ) {
                        group.active = !group.active;
                    }

                    return group;
                } );
            }

            return Object.assign( {}, state, {
                items: updatedItems,
            } );
        case RECEIVE_GROUPS:
            if ( typeof currentQuery[ 'groups[]' ] !== 'undefined' ) {
                updatedItems = action.items.map( ( group ) => {
                    if ( currentQuery[ 'groups[]' ].indexOf( group.name ) > -1 ) {
                        group.active = true;
                    }

                    return group;
                } );

                return Object.assign( {}, state, {
                    items: updatedItems,
                } );
            }

            return Object.assign( {}, state, {
                items: action.items,
            } );
        default:
            if ( typeof currentQuery[ 'groups[]' ] !== 'undefined' ) {
                if ( state.items.length <= 0 ) {
                    updatedItems = [];
                    for ( let i = 0; i < currentQuery[ 'groups[]' ].length; i = i + 1 ) {
                        updatedItems.push( {
                            active: true,
                            name: currentQuery[ 'groups[]' ][ i ],
                        } );
                    }
                } else {
                    updatedItems = state.items.map( ( group ) => {
                        if ( currentQuery[ 'groups[]' ].indexOf( group.name ) > -1 ) {
                            group.active = true;
                        }

                        return group;
                    } );
                }

                return Object.assign( {}, state, {
                    items: updatedItems,
                } );
            }

            return state;
    }
};

const services = function services ( state = {
    items: [],
}, action ) {
    let updatedItems;
    const currentQuery = queryString.parse( location.search );

    if ( typeof currentQuery[ 'services[]' ] === 'string' ) {
        currentQuery[ 'services[]' ] = [ currentQuery[ 'services[]' ] ];
    }

    switch ( action.type ) {
        case TOGGLE_SERVICE:
            updatedItems = state.items.map( ( service ) => {
                if ( service.name === action.name ) {
                    service.active = !service.active;
                }

                return service;
            } );

            // Save an array of active services
            cookie.save( 'services',
                updatedItems
                    .map( ( service ) => {
                        if ( service.active ) {
                            return service.name;
                        }

                        return false;
                    } )
                    .filter( ( service ) => {
                        return service;
                    } )
                , {
                    path: '/',
                }
            );

            return Object.assign( {}, state, {
                items: updatedItems,
            } );
        case RECEIVE_SERVICES:
            if ( typeof currentQuery[ 'service[]' ] !== 'undefined' ) {
                updatedItems = action.items.map( ( service ) => {
                    if ( currentQuery[ 'service[]' ].indexOf( service.name ) > -1 ) {
                        service.active = true;
                    }

                    return service;
                } );

                return Object.assign( {}, state, {
                    items: updatedItems,
                } );
            } else if ( cookie.load( 'services' ) ) {
                const activeServices = cookie.load( 'services' );

                updatedItems = action.items.map( ( service ) => {
                    if ( activeServices.indexOf( service.name ) > -1 ) {
                        service.active = true;
                    } else {
                        service.active = false;
                    }

                    return service;
                } );

                return Object.assign( {}, state, {
                    items: updatedItems,
                } );
            }

            return Object.assign( {}, state, {
                items: action.items,
            } );
        default:
            if ( typeof currentQuery[ 'service[]' ] !== 'undefined' ) {
                if ( state.items.length <= 0 ) {
                    updatedItems = [];
                    for ( let i = 0; i < currentQuery[ 'service[]' ].length; i = i + 1 ) {
                        updatedItems.push( {
                            active: true,
                            name: currentQuery[ 'service[]' ][ i ],
                        } );
                    }
                } else {
                    updatedItems = state.items.map( ( service ) => {
                        if ( currentQuery[ 'service[]' ].indexOf( service.name ) > -1 ) {
                            service.active = true;
                        }

                        return service;
                    } );
                }

                return Object.assign( {}, state, {
                    items: updatedItems,
                } );
            }

            return state;
    }
};

const search = function search ( state, action ) {
    const currentQuery = queryString.parse( location.search );

    switch ( action.type ) {
        case SET_SEARCH_TERM:
            return action.term;
        default:
            if ( typeof currentQuery.search !== 'undefined' ) {
                return currentQuery.search;
            }

            return '';
    }
};

const posts = function posts ( state = {
    items: [],
}, action ) {
    switch ( action.type ) {
        case REQUEST_POSTS:
            return Object.assign( {}, state );
        case RECEIVE_POSTS:
            return Object.assign( {}, state, {
                items: action.posts,
                lastUpdated: action.receivedAt,
            } );
        default:
            return state;
    }
};

const trackerApp = combineReducers( {
    groups,
    posts,
    search,
    services,
} );

export default trackerApp;
