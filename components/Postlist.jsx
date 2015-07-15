'use strict';

var React = require( 'react' );
var Post = require( './Post.jsx' );
var $ = require( 'jquery' );
var debounce = require( 'debounce' );
var Search = require( './Search.jsx' );

module.exports = React.createClass({
    updateDataTimeout : false,
    setUpdateTimeout : function(){
        this.updateDataTimeout = setTimeout( this.loadCommentsFromServer, this.props.pollInterval );
    },
    getInitialState: function() {
        return {
            data: [],
            searchString: ''
        };
    },
    handleSearch: function( searchString ){
        this.debouncedSearch( searchString );
    },
    search: function( searchString ){
        this.setState({
            searchString: searchString
        });

        this.loadCommentsFromServer( searchString );
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
                <Search handleSearch={this.handleSearch}></Search>
                <div className="communityPostList">
                    {postNodes}
                </div>
            </div>
        );
    }
});
