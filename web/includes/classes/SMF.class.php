<?php
class SMF extends Kurl {
    private static $profileBase = '{{path}}index.php?action=profile;area=showposts;u={{userId}}';

    private $posts = array();

    public function __construct( $uid, $identifier, $serviceData ){
        $this->uid = $uid;
        $this->identifier = $identifier;
        $this->path = $serviceData[ 'endpoint' ];
        $this->serviceIdentifier = $serviceData[ 'identifier' ];

        include_once( __DIR__ . '/../simple_html_dom.php' );
    }

    public function getRecentPosts(){
        $url = str_replace( '{{userId}}', $this->identifier, self::$profileBase );
        $url = str_replace( '{{path}}', $this->path, $url );

        $html = str_get_html( $this->loadUrl( $url, 0 ) );

        // Find all article blocks
        foreach( $html->find( 'div.topic' ) as $forumPost ) :
            // Parse time into a timestamp
            $time = $forumPost->find( 'span.smalltext', 0 )->plaintext;
            $time = str_replace( array( '&#171;&nbsp;on:', '&nbsp;&#187;' ), '', $time );
            $time = trim( $time );

            $postLink = $forumPost->find( 'a', 1 );

            if( strpos( $postLink->plaintext, 'Re:' ) === 0 ):
                $topicTitle = substr( $postLink->plaintext, 3 );
            else :
                $topicTitle = $postLink->plaintext;
            endif;

            preg_match( '#(.+?topic=\d+)#mis', $postLink->href, $topicUrl );
            $topicUrl = $topicUrl[ 0 ];
            $post = new Post();

            $post->setSection( $forumPost->find( 'a', 0 )->plaintext );

            $post->setTimestamp( strtotime( $time ) );
            $post->setTopic( $topicTitle, $topicUrl );
            $post->setText( $forumPost->find( 'div.list_posts', 0 )->innertext );
            $post->setUrl( $postLink->href );
            $post->setUserId( $this->uid );

            $post->setSource( $this->serviceIdentifier );

            $this->posts[] = $post;
        endforeach;

        return $this->posts;
    }
}
