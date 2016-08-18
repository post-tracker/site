import React from 'react';
import queryString from 'query-string';

class Search extends React.Component {
    constructor( props ){
        let currentQuery = queryString.parse( location.search );

        super( props );

        this.state = {
            searchString: ''
        };

        if( typeof currentQuery.search !== 'undefined' ){
            this.state.searchString = currentQuery.search;
        }
    }

    handleChange( event ){
        var searchString = event.target.value;

        this.props.handleSearch( searchString );

        this.setState({
            searchString: searchString
        });
    }

    clearInput(){
        this.props.handleSearch( '' );

        this.setState({
            searchString: ''
        });
    }

    render() {
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
};

export default Search;
