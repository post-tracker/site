'use strict';

var React = require( 'react' );
var Post = require( './Post.jsx' );
var $ = require( 'jquery' );

module.exports = React.createClass({
    getInitialState: function() {
        return {
            data: []
        };
    },
    loadCommentsFromServer: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function( data ) {
                this.setState({
                    data: data
                });
            }.bind( this ),
            error: function( xhr, status, err ) {
                console.error( this.props.url, status, err.toString() );
            }.bind( this )
        });
    },
    componentDidMount: function() {
        this.loadCommentsFromServer();
        setInterval( this.loadCommentsFromServer, this.props.pollInterval );
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
            <div className="communityPostList">
                {postNodes}
            </div>
        );
    }
});
