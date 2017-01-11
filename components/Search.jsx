import https from 'https';

import React from 'react';
import queryString from 'query-string';

class Search extends React.Component {
    constructor ( props ) {
        const currentQuery = queryString.parse( location.search );

        super( props );

        this.state = {
            activeGroups: [],
            groups: [],
            searchString: '',
            showFilters: false,
        };

        this.clearInput = this.clearInput.bind( this );
        this.handleChange = this.handleChange.bind( this );
        this.handleClearClick = this.handleClearClick.bind( this );
        this.handleCheckboxChange = this.handleCheckboxChange.bind( this );
        this.handleAllCheckboxChange = this.handleAllCheckboxChange.bind( this );
        this.handleFilterExpandClick = this.handleFilterExpandClick.bind( this );

        if ( typeof currentQuery.search !== 'undefined' ) {
            // eslint-disable-next-line react/no-direct-mutation-state
            this.state.searchString = currentQuery.search;
        }

        if ( typeof currentQuery[ 'groups[]' ] !== 'undefined' ) {
            let groups = currentQuery[ 'groups[]' ];

            if ( typeof groups !== 'object' ) {
                groups = [ groups ];
            }

            // eslint-disable-next-line react/no-direct-mutation-state
            this.state.activeGroups = groups;
            this.state.showFilters = true;
        }
    }

    componentWillMount () {
        this.getGroups();
    }

    handleChange ( event ) {
        const searchString = event.target.value;

        this.props.handleSearch( searchString, this.state.activeGroups );

        this.setState( {
            searchString: searchString,
        } );
    }

    handleSubmit ( event ) {
        event.preventDefault();
    }

    handleClearClick () {
        this.clearInput();
    }

    handleFilterExpandClick () {
        this.expandGroups();
    }

    handleAllCheckboxChange ( event ) {
        if ( event.target.checked ) {
            for ( let i = 0; i < this.checkboxes.length; i = i + 1 ) {
                this.checkboxes[ i ].checked = false;
            }

            this.props.handleSearch( this.state.searchString, [] );

            this.setState( {
                activeGroups: [],
            } );
        }
    }

    handleCheckboxChange ( event ) {
        const currentGroups = this.state.activeGroups;

        if ( event.target.checked ) {
            currentGroups.push( event.target.name );
        } else {
            currentGroups.splice( currentGroups.indexOf( event.target.name ), 1 );
        }

        if ( currentGroups.length === this.state.groups.length ) {
            this.props.handleSearch( this.state.searchString, [] );
        } else {
            this.props.handleSearch( this.state.searchString, currentGroups );
        }

        if ( currentGroups.length === 0 ) {
            this.allCheckbox.checked = true;
        } else {
            this.allCheckbox.checked = false;
        }

        this.setState( {
            activeGroups: currentGroups,
        } );
    }

    expandGroups () {
        this.setState( {
            showFilters: true,
        } );
    }

    getGroups () {
        const options = {
            hostname: window.location.hostname,
            method: 'GET',
            path: window.location.pathname + this.props.url,
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

                this.setState( {
                    groups: groups,
                } );
            } );
        } );

        request.on( 'error', ( requestError ) => {
            // eslint-disable-next-line no-console
            console.log( `problem with request: ${ requestError.message }` );
        } );

        request.end();
    }

    parseGroupName ( groupName ) {
        return groupName
            .toLowerCase()
            .replace( /\s/gim, '-' )
            .replace( /[^a-z0-9\-]/gim, '' );
    }

    clearInput () {
        this.props.handleSearch( '', this.state.activeGroups );

        this.setState( {
            searchString: '',
        } );
    }

    render () {
        const searchString = this.state.searchString;
        let clearer;
        let groupsClasses = 'groups-wrapper';

        this.checkboxes = [];

        const groupNodes = this.state.groups.map( ( group ) => {
            let defaultChecked = false;

            if ( this.state.activeGroups.indexOf( group ) > -1 ) {
                defaultChecked = true;
            }

            return (
                <div
                    className = { 'checkbox' }
                    key = { group }
                >
                    <label>
                        <input
                            defaultChecked = { defaultChecked }
                            name = { group }
                            onChange = { this.handleCheckboxChange }
                            // eslint-disable-next-line react/jsx-no-bind
                            ref = { ( node ) => {
                                if ( node !== null ) {
                                    this.checkboxes.push( node );
                                }
                            } }
                            type = { 'checkbox' }
                        />
                        <span
                            className = { `group-label ${ this.parseGroupName( group ) }` }
                            title = { group }
                        >
                            { group }
                        </span>
                    </label>
                </div>
            );
        } );

        if ( groupNodes.length > 1 ) {
            let defaultChecked = true;

            if ( this.state.activeGroups.length > 0 ) {
                defaultChecked = false;
            }

            groupNodes.push( (
                <div
                    className = { 'checkbox' }
                    key = { 'all' }
                >
                    <label>
                        <input
                            defaultChecked = { defaultChecked }
                            name = { 'all' }
                            onChange = { this.handleAllCheckboxChange }
                            // eslint-disable-next-line react/jsx-no-bind
                            ref = { ( node ) => {
                                this.allCheckbox = node;
                            } }
                            type = { 'checkbox' }
                        />
                        <span
                            className = { 'group-label all' }
                            title = { 'All' }
                        >
                            { 'All' }
                        </span>
                    </label>
                </div>
            ) );
        } else {
            groupsClasses = `${ groupsClasses } hidden`;
        }

        if ( searchString.length > 0 ) {
            clearer = (
                <span
                    className = { 'clearer fa fa-times-circle-o form-control-feedback' }
                    onClick = { this.handleClearClick }
                />
            );
        }

        if ( this.state.showFilters ) {
            groupsClasses = `${ groupsClasses } show`;
        }

        return (
            <form
                onSubmit = { this.handleSubmit }
            >
                <div
                    className = { 'form-group has-feedback' }
                >
                    <input
                        className = { 'form-control' }
                        name = { 'search' }
                        onChange = { this.handleChange }
                        placeholder = { 'Search...' }
                        role = { 'search' }
                        type = { 'text' }
                        value = { searchString }
                    />
                    { clearer }
                </div>
                <div
                    className = { groupsClasses }
                >
                    <div
                        className = { 'filters-wrapper' }
                        onClick = { this.handleFilterExpandClick }
                        style = { {
                            textAlign: 'right'
                        } }
                    >
                        { 'Filters' }
                        <i
                            className = { 'fa fa-caret-down' }
                            style = { {
                                marginLeft: '10px'
                            } }
                        />
                    </div>
                    { groupNodes }
                </div>
            </form>
        );
    }
}

Search.displayName = 'Search';

Search.propTypes = {
    handleSearch: React.PropTypes.func,
    url: React.PropTypes.string,
};

export default Search;
