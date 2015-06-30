<?php
class Post extends Kurl {
    public $topic;
    public $user;
    public $text;
    public $url;
    public $source;

    public function __construct(){
        global $roles;

        $this->roles = $roles;
    }

    public function setTimestamp( $timestamp ){
        $this->timestamp = $timestamp;
    }

    public function setTopic( $title, $url ){
        $this->topic = array(
            'title' => $title,
            'url' => $url
        );
    }

    public function setText( $text ){
        $this->text = $text;
    }

    public function setUrl( $url ){
        $this->url = $url;
    }

    public function setUser( $name, $identifier ){
        $this->user = array(
            'name' => $name,
            'identifier' => $identifier
        );

        if( isset( $this->roles[ $name ] ) ) :
            $this->user[ 'role' ] = $this->roles[ $name ];
        endif;
    }

    public function setSource( $source ){
        $this->source = $source;
    }

    private function postExists(){
        global $database;

        $query = 'SELECT COUNT(*) FROM posts WHERE url = :url LIMIT 1';
        $PDO = $database->prepare( $query );

        $PDO->bindValue( ':url', $this->url );

        $PDO->execute();

        if( $PDO->fetchColumn() > 0 ) :
            return true;
        endif;

        return false;
    }

    public function save(){
        if( $this->postExists() ) :
            return false;
        endif;

        if( $this->timestamp <= 0 ) :
            $this->timestamp = time();
        endif;

        global $database;

        $query = 'INSERT INTO posts ( topic, topic_url, user, user_identifier, url, source, content, timestamp ) VALUES( :topic, :topicUrl, :user, :userIdentifier, :url, :source, :content, :timestamp )';
        $PDO = $database->prepare( $query );

        $PDO->bindValue( ':topic', $this->topic[ 'title' ] );
        $PDO->bindValue( ':topicUrl', $this->topic[ 'url' ] );
        $PDO->bindValue( ':user', $this->user[ 'name' ] );
        $PDO->bindValue( ':userIdentifier', $this->user[ 'identifier' ] );
        $PDO->bindValue( ':url', $this->url );
        $PDO->bindValue( ':source', $this->source );
        $PDO->bindValue( ':content', $this->text );
        $PDO->bindValue( ':timestamp', $this->timestamp );

        return $PDO->execute();
    }
}
