<?php
class Kurl {
    private $data = false;

    public function loadUrl( $url ){
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

        apc_store( $url, $this->data, 60 );
    }
}
