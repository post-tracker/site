import React from 'react';
import PropTypes from 'prop-types';

const styles = {
    clearer: {
        height: '15px',
        pointerEvents: 'auto',
        position: 'absolute',
        right: '6px',
        top: '6px',
        width: '15px',
        zIndex: 1,
    },
};

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
                <svg
                    className = { 'icon clearer' }
                    onClick = { this.handleClearClick }
                    style = { styles.clearer }
                >
                    <use
                        xlinkHref = { '#icon-clear' }
                    />
                </svg>
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
    searchTerm: PropTypes.string.isRequired,
    updateSearchTerm: PropTypes.func.isRequired,
};

export default Search;
