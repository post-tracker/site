'use strict';

var React = require( 'react' );
var queryString = require( 'query-string' );

module.exports = React.createClass({
    getInitialState: function() {
        var currentQuery = queryString.parse( location.search ),
            defaultState =  {
                searchString: ''
            };

        if( typeof currentQuery.search !== 'undefined' ){
            defaultState.searchString = currentQuery.search;
        }

        return defaultState;
    },
    handleChange: function( event ){
        var searchString = event.target.value;

        this.props.handleSearch( searchString );

        this.setState({
            searchString: searchString
        });
    },
    clearInput: function(){
        this.props.handleSearch( '' );

        this.setState({
            searchString: ''
        });
    },
    render: function() {
        var searchString = this.state.searchString,
            clearer;

        if( searchString.length > 0 ){
            clearer = <span className="clearer fa fa-times-circle-o form-control-feedback" onClick={this.clearInput}></span>;
        }

        return (
            <form>
                <div className="form-group has-feedback">
                    <input
                        type="text"
                        role="search"
                        name="search"
                        className="form-control"
                        placeholder="Search..."
                        value={searchString}
                        onChange={this.handleChange}
                    ></input>
                    {clearer}
                </div>
            </form>
        );
    }
});
