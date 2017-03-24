<?php
class IPB extends Kurl {
    private static $profileBase = '{{path}}/profile/{{userId}}/?do=content&type=forums_topic_post&change_section=1';

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
        foreach( $html->find( 'div.ipsComment_content ' ) as $forumPost ) :
            $url = $forumPost->find( 'h3 a', 0 )->href;
            $text = $forumPost->find( '.ipsType_richText', 0 )->innertext;

            $text = preg_replace( '#(?<=ipsQuote_citation">)(.+?),#mis', '', $text );

            $post = new Post();

            $post->setTimestamp( strtotime( $forumPost->find( 'time', 0 )->datetime ) );
            $post->setTopic( $forumPost->find( 'h3', 0 )->plaintext, substr( $url, 0, strrpos( $url, '/' ) + 1 ) );
            $post->setText( $text );
            $post->setUrl( $url );
            $post->setUserId( $this->uid );

            $post->setSource( $this->serviceIdentifier );

            $this->posts[] = $post;
        endforeach;

        return $this->posts;
    }
}
