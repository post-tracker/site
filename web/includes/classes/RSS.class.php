<?php
class RSS extends Kurl {
    private $posts = array();
    private $developers = array();

    public function __construct( $feedURI ){
        $this->feedURI = $feedURI;

        $this->loadDevelopers();
    }

    private function loadDevelopers(){
        global $database;

        $query = 'SELECT id, nick, name FROM developers';
        $PDO = $database->prepare( $query );
        $PDO->execute();

        while( $developer = $PDO->fetch() ):
            $this->developers[ $developer->nick ] = $developer->id;
            $this->developers[ $developer->name ] = $developer->id;
        endwhile;
    }

    public function getRecentPosts(){
        $this->loadComments();

        return $this->posts;
    }

    private function loadComments(){
        $data = $this->loadUrl( $this->feedURI, 300 );
        $xml = simplexml_load_string( $data );

        foreach( $xml->channel->item as $rssPost ):
            $post = new Post();
            list( $developer, $topicTitle ) = explode( ' - ', $rssPost->title, 2 );

            if( strpos( $rssPost->link, '&p' ) !== false ):
                $topicUrl = substr( $rssPost->link, 0, strpos( $rssPost->link, '&p' ) );
            else :
                $topicUrl = ( string ) $rssPost->link;
            endif;

            // This only works as long as the timezone is +0000
            $post->setTimestamp( strtotime( $rssPost->pubDate ) );

            $post->setTopic( $topicTitle, $topicUrl );

            $post->setText( trim( preg_replace( '#<a href=".+?">see more</a>#mis', '', $rssPost->description ) ) );
            $post->setUrl( ( string ) $rssPost->link );

            // Skip posts we don't find a developer for
            if( !isset( $this->developers[ $developer ] ) ):
                echo '<a href="', $rssPost->link, '">Failed to find developer ', $developer, '</a><br>';
                continue;
            endif;

            $post->setUserId( $this->developers[ $developer ] );

            $post->setSource( 'rss' );

            if( $post->isValid() ) :
                $this->posts[] = $post;
            endif;
        endforeach;
    }
}
