<?php
class Kurl {
    private $data = false;
    private $ttl = 900;

    public function loadUrl( $url, $customTTL = false ){
        if( $customTTL !== false ):
            $this->ttl = $customTTL;
        endif;

        if( $this->ttl <= 0 ):
            $this->loadFromWeb( $url );
        else :
            $this->loadFromCache( $url );
        endif;

        return $this->data;
    }

    private function loadFromCache( $key ){
        $this->data = apcu_fetch( $key );

        if( $this->data == false ) :
            $this->loadFromWeb( $key );
        endif;
    }

    private function loadFromWeb( $url ){
        $this->data = file_get_contents( $url );

        if( $this->data && $this->ttl > 0 ):
            apcu_store( $url, true, $this->ttl );
        endif;
    }
}
