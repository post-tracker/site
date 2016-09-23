import React from 'react';
import queryString from 'query-string';

class Search extends React.Component {
    constructor ( props ) {
        const currentQuery = queryString.parse( location.search );

        super( props );

        this.state = {
            searchString: '',
        };

        this.clearInput = this.clearInput.bind( this );
        this.handleChange = this.handleChange.bind( this );
        this.handleClearClick = this.handleClearClick.bind( this );

        if ( typeof currentQuery.search !== 'undefined' ) {
            // eslint-disable-next-line react/no-direct-mutation-state
            this.state.searchString = currentQuery.search;
        }
    }

    handleChange ( event ) {
        const searchString = event.target.value;

        this.props.handleSearch( searchString );

        this.setState( {
            searchString: searchString,
        } );
    }

    handleClearClick () {
        this.clearInput();
    }

    clearInput () {
        this.props.handleSearch( '' );

        this.setState( {
            searchString: '',
        } );
    }

    render () {
        const searchString = this.state.searchString;
        let clearer;

        if ( searchString.length > 0 ) {
            clearer = (
                <span
                    className = { 'clearer fa fa-times-circle-o form-control-feedback' }
                    onClick = { this.handleClearClick }
                />
            );
        }

        return (
            <form>
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
            </form>
        );
    }
}

Search.displayName = 'Search';

Search.propTypes = {
    handleSearch: React.PropTypes.func,
};

export default Search;
