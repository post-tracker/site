<?php
class Couch {
    public function __construct( $path ) {
        $this->path = $path;
    }

    public function test(){
        return $this->load( $this->path );
    }

    public function getLatestPosts(){
        return $this->load( $this->path . '/posts/_all_docs?limit=20&include_docs=true' );
    }

    private function load( $url ) {
        return json_decode( file_get_contents( 'http://' . $url ) );
    }
}
