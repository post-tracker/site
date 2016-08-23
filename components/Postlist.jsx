import http from 'http';

import React from 'react';
import debounce from 'debounce';
import Hashes from 'jshashes';

import Post from './Post.jsx';
import Search from './Search.jsx';

class PostList extends React.Component {
    constructor( props ){
        super( props );

        this.state =  {
            data: [],
            searchString: ''
        }

        this.handleSearch = this.handleSearch.bind( this );

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

        let options = {
            hostname: window.location.hostname,
            port: window.location.port || 80,
            path: window.location.pathname + this.props.url,
            method: 'GET'
        };

        if( typeof searchString !== 'undefined' ){
            // This happends the first time
            options.path = options.path + '?search=' + searchString;

        } else if( this.state.searchString.length > 0 ){
            // This happends when we load posts again after some time
            options.path = options.path + '?search=' + this.state.searchString;
        }

        let request = http.request( options, ( response ) => {
            let body = '';
            response.setEncoding( 'utf8' );

            response.on( 'data', ( chunk ) => {
                body = body + chunk;
            });

            response.on( 'end', () => {
                this.setState({
                    data: JSON.parse( body )
                });
            });

            this.setUpdateTimeout();
        });

        request.on('error', (e) => {
            console.log(`problem with request: ${e.message}`);
        });

        request.end();
    }

    componentWillMount() {
        this.debouncedSearch = debounce( this.search, 250 );
    }

    componentDidMount() {
        this.loadCommentsFromServer();
        this.setUpdateTimeout();
    }

    render() {
        let postNodes = this.state.data.map( ( communityPost ) => {
            let hash = new Hashes.MD5().hex( communityPost.author + communityPost.timestamp + communityPost.content );
            return (
                <Post
                    key = { hash }
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
