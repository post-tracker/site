<?php
class Couch {
    public function __construct( $path ) {
        $this->path = $path;
    }

    public function test(){
        return $this->load( $this->path );
    }

    public function getLatestPostsByGame( $game ){
        return $this->load( $this->path . '/posts/_all_docs?limit=20&include_docs=true' );
    }

    public function getSearchResult( $game, $searchString ) {
        return false;
    }

    public function getPostsByGroupsAndGame( $groups, $game ) {
        return false;
    }

    private function load( $url ) {
        return json_decode( file_get_contents( 'http://' . $url ) );
    }
}
