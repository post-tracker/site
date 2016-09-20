<?php
class Steam {
    private static $profileBase = 'http://steamcommunity.com/profiles/{{userIdentifier}}/posthistory/';
    private static $idBase = 'http://steamcommunity.com/id/{{userIdentifier}}/posthistory/';

    private $posts = array();

    public function __construct( $uid, $identifier ){
        $this->uid = $uid;
        $this->identifier = $identifier;

        include_once( __DIR__ . '/../simple_html_dom.php' );
    }

    public function getRecentPosts(){
        if( is_numeric( $this->identifier ) ) :
            $url = str_replace( '{{userIdentifier}}', $this->identifier, self::$profileBase );
        else :
            $url = str_replace( '{{userIdentifier}}', $this->identifier, self::$idBase );
        endif;

        $html = str_get_html( $this->loadUrl( $url ) );

        // Find all article blocks
        foreach( $html->find( 'div.post_searchresult' ) as $communityPost ) :
            // Parse time into a timestamp
            $time = $communityPost->find( 'div.searchresult_timestamp', 0 )->plaintext;
            $time = str_replace( '@', date( 'o' ), $time );

            // Parse post url to a valid one
            $url = $communityPost->find( 'div.post_searchresult_simplereply', 0 )->onclick;
            $url = str_replace( 'window.location=', '', $url );
            $url = str_replace( '\'', '', $url );

            $post = new Post();

            $post->setTimestamp( strtotime( $time ) );
            $post->setTopic( $communityPost->find( 'a.forum_topic_link', 0 )->plaintext, $communityPost->find( 'a.forum_topic_link', 0 )->href );
            $post->setText( $communityPost->find( 'div.post_searchresult_simplereply', 0 )->innertext );
            $post->setUrl( $url );
            $post->setUserId( $this->uid );

            $post->setSource( 'Steam' );

            if( strpos( $post->text, 'blockquote' ) !== false ):
                $post->text = preg_replace( '/href="\#(.+?)"/mis', 'href="' . $communityPost->find( 'a.forum_topic_link', 0 )->href . '#$1"', $post->text );
            endif;

            $this->posts[] = $post;
        endforeach;

        return $this->posts;
    }

    private function loadUrl( $url ){
        return file_get_contents( $url );
    }
}
