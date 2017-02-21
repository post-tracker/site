import React from 'react';

class Search extends React.Component {
    constructor ( props ) {
        super( props );

        this.handleSubmit = this.handleSubmit.bind( this );
        this.handleClearClick = this.handleClearClick.bind( this );
        this.handleChange = this.handleChange.bind( this );
    }

    handleSubmit ( event ) {
        event.preventDefault();
    }

    handleClearClick () {
        this.input.value = '';
        this.props.updateSearchTerm( '' );
    }

    handleChange ( event ) {
        this.props.updateSearchTerm( event.target.value );
    }

    render () {
        let clearerNode;

        if ( this.props.searchTerm.length > 0 ) {
            clearerNode = (
                <span
                    className = { 'clearer fa fa-times-circle-o form-control-feedback' }
                    onClick = { this.handleClearClick }
                />
            );
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
                        defaultValue = { this.props.searchTerm }
                        name = { 'search' }
                        onChange = { this.handleChange }
                        placeholder = { 'Search...' }
                        // eslint-disable-next-line react/jsx-no-bind
                        ref = { ( input ) => {
                            this.input = input;
                        } }
                        role = { 'search' }
                        type = { 'text' }
                    />
                    { clearerNode }
                </div>

            </form>
        );
    }
}

Search.displayName = 'Search';

Search.propTypes = {
    searchTerm: React.PropTypes.string.isRequired,
    updateSearchTerm: React.PropTypes.func.isRequired,
};

export default Search;
