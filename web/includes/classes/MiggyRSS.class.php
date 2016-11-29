<?php
class MiggyRSS extends Kurl {
    private $posts = array();
    private $developers = array();

    public function __construct( $feedURI ){
        $this->feedURI = $feedURI;

        $this->loadDevelopers();
    }

    private function loadDevelopers(){
        global $database;

        $query = 'SELECT
            developers.id,
            developers.nick,
            developers.name,
            accounts.identifier
        FROM
            developers,
            accounts
        WHERE
            developers.id = accounts.uid
        AND
            accounts.service = :service';
        $PDO = $database->prepare( $query );
        $PDO->bindValue( ':service', 'MiggyRSS' );
        $PDO->execute();

        while( $developer = $PDO->fetch() ):
            $this->developers[ strtolower( $developer->nick ) ] = $developer->id;
            $this->developers[ strtolower( $developer->name ) ] = $developer->id;
        endwhile;
    }

    public function getRecentPosts(){
        $this->loadComments();

        return $this->posts;
    }

    private function loadComments(){
        $data = $this->loadUrl( $this->feedURI, 300 );

        if( is_bool( $data ) ):
            return false;
        endif;

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
            if( !isset( $this->developers[ strtolower( $developer ) ] ) ):
                echo '<a href="', $rssPost->link, '">Failed to find developer ', $developer, '</a><br>';
                continue;
            endif;

            $post->setUserId( $this->developers[ strtolower( $developer ) ] );

            $post->setSource( 'MiggyRSS' );

            $this->posts[] = $post;
        endforeach;
    }
}
