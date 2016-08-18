import React from 'react';
import $ from 'jquery';
import debounce from 'debounce';
import hash from 'object-hash';

import Post from './Post.jsx';
import Search from './Search.jsx';

class PostList extends React.Component {
    constructor( props ){
        super( props );

        this.state =  {
            data: [],
            searchString: ''
        }

        this.updateDataTimeout = false;
    }

    setUpdateTimeout(){
        this.updateDataTimeout = setTimeout( this.loadCommentsFromServer, this.props.pollInterval );
    }

    handleSearch( searchString ){
        this.debouncedSearch( searchString );
    }

    search( searchString ){
        this.setState({
            searchString: searchString
        });

        this.loadCommentsFromServer( searchString );
    }

    loadCommentsFromServer( searchString ) {
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
    }

    componentWillMount() {
        this.debouncedSearch = debounce( this.search, 250 );
    }

    componentDidMount() {
        this.loadCommentsFromServer();
        this.setUpdateTimeout();
    }

    render() {
        var postNodes = this.state.data.map( function( communityPost ) {
            return (
                <Post
                    key = { hash( communityPost ) }
                    data = { communityPost }
                ></Post>
            );
        });
        
        return (
            <div>
                <Search handleSearch = { this.handleSearch }></Search>
                { postNodes }
            </div>
        );
    }
};

export default PostList;
