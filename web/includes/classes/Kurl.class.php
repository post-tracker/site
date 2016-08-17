<?php
class Kurl {
    private $data = false;
    private $ttl = 60;

    public function loadUrl( $url, $customTTL = false ){
        if( $customTTL ):
            $this->ttl = $customTTL;
        endif;

        $this->loadFromCache( $url );

        return $this->data;
    }

    private function loadFromCache( $key ){
        $this->data = apc_fetch( $key );

        if( $this->data == false ) :
            $this->loadFromWeb( $key );
        endif;
    }

    private function loadFromWeb( $url ){
        $this->data = file_get_contents( $url );

        if( $this->data ):
            apc_store( $url, $this->data, $this->ttl );
        endif;
    }
}
