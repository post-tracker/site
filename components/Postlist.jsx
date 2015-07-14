'use strict';

var React = require( 'react' );
var Post = require( './Post.jsx' );
var $ = require( 'jquery' );
var debounce = require( 'debounce' );
var queryString = require( 'query-string' );

module.exports = React.createClass({
    updateDataTimeout : false,
    setUpdateTimeout : function(){
        this.updateDataTimeout = setTimeout( this.loadCommentsFromServer, this.props.pollInterval );
    },
    getInitialState: function() {
        var currentQuery = queryString.parse( location.search ),
            defaultState =  {
                data: [],
                searchString: ''
            };

        if( typeof currentQuery.search !== 'undefined' ){
            defaultState.searchString = currentQuery.search;
        }

        return defaultState;
    },
    handleSearch: function( event ){
        event.persist();
        this.debouncedSearch( event );
    },
    search: function( event ){
        this.setState({
            searchString: event.target.value
        });

        this.loadCommentsFromServer( event.target.value );
    },
    loadCommentsFromServer: function( searchString ) {
        clearTimeout( this.updateDataTimeout );

        var options = {
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function( data ) {
                this.setState({
                    data: data
                });

                this.setUpdateTimeout();
            }.bind( this ),
            error: function( xhr, status, err ) {
                console.error( this.props.url, status, err.toString() );
                this.setUpdateTimeout();
            }.bind( this )
        };

        if( typeof searchString !== 'undefined' ){
            // This happends the first time
            options.data = {
                search: searchString
            };
        } else if( this.state.searchString.length > 0 ){
            // This happends when we load posts again after some time
            options.data = {
                search: this.state.searchString
            };
        }

        $.ajax( options );
    },
    componentWillMount: function() {
        this.debouncedSearch = debounce( this.search, 250 );
    },
    componentDidMount: function() {
        this.loadCommentsFromServer();
        this.setUpdateTimeout();
    },
    render: function() {
        var postNodes = this.state.data.map( function( communityPost ) {
            return (
                <Post
                    data={communityPost}>
                </Post>
            );
        });
        return (
            <div>
                <form>
                    <input
                        type="text"
                        role="search"
                        name="search"
                        className="form-control"
                        placeholder="Search..."
                        defaultValue={this.state.searchString}
                        onChange={this.handleSearch}
                    ></input>
                </form>
                <div className="communityPostList">
                    {postNodes}
                </div>
            </div>
        );
    }
});
