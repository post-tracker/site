<?php
class Post extends Kurl {
    public $topic;
    public $uid;
    public $text;
    public $url;
    public $source;

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
        $this->text = trim( $text );
    }

    public function setUrl( $url ){
        $this->url = $url;
    }

    public function setUserId( $uid ){
        $this->uid = $uid;
    }

    public function setSource( $source ){
        $this->source = $source;
    }

    public function isValid(){
        if( strlen( $this->text ) > 0 ) :
            return true;
        endif;
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

        $query = 'INSERT INTO posts ( topic, topic_url, uid, url, source, content, timestamp ) VALUES( :topic, :topicUrl, :uid, :url, :source, :content, :timestamp )';
        $PDO = $database->prepare( $query );

        $PDO->bindValue( ':topic', $this->topic[ 'title' ] );
        $PDO->bindValue( ':topicUrl', $this->topic[ 'url' ] );
        $PDO->bindValue( ':uid', $this->uid );
        $PDO->bindValue( ':url', $this->url );
        $PDO->bindValue( ':source', $this->source );
        $PDO->bindValue( ':content', $this->text );
        $PDO->bindValue( ':timestamp', $this->timestamp );

        return $PDO->execute();
    }
}
