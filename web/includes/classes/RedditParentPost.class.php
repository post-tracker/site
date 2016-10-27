<?php
class RedditParentPost extends Kurl {
    private static $apiBase = 'https://www.reddit.com';
    private static $singleCommentUrl = '/comments/{topicid}/{commentid}.json';

    public function __construct( $topicid, $commentid ){
        $this->topicid = $topicid;
        $this->id = $commentid;

        $this->load();
    }

    private function findPostData( $dataset ){
        foreach( $dataset as $post ):
            if( $post->data->id == $this->id ) :
                return $post->data;
            endif;

            if( isset( $post->data->replies ) && is_object( $post->data->replies ) ):
                $postData = $this->findPostData( $post->data->replies->data->children );
            endif;

            if( isset( $postData ) && $postData ):
                return $postData;
            endif;
        endforeach;
    }

    private function load(){
        $url = self::$apiBase . str_replace( array( '{topicid}', '{commentid}' ), array( $this->topicid, $this->id ), self::$singleCommentUrl );
        // This we can store a month, it will not change
        $this->rawData = json_decode( $this->loadUrl( $url, 86400 ) );

        $parentData = $this->rawData[ 0 ]->data->children[ 0 ]->data;

        if( isset( $this->rawData[ 1 ]->data->children ) ):
            $postData = $this->findPostData( $this->rawData[ 1 ]->data->children );
        endif;

        if( !$postData ):
            $postData = $this->findPostData( $this->rawData[ 0 ]->data->children );
        endif;

        if( !isset( $postData ) || !$postData || !isset( $postData->created_utc ) ):
            return false;
        endif;

        $urlParts = array_filter( explode( '/', $parentData->permalink ), 'strlen' );
        $this->topic = end( $urlParts );

        $this->post = new Post();
        $this->post->setTimestamp( $postData->created_utc );

        if( isset( $postData->body_html ) ):
            $text = html_entity_decode( $postData->body_html );
        else:
            $text = html_entity_decode( $postData->selftext_html );
        endif;

        $text = preg_replace( '#href="/([ur])/#', 'href="https://reddit.com/$1/', $text );
        $this->post->setText( $text );
        $this->post->setUrl( self::$apiBase . $parentData->permalink . $this->id . '#' . $this->id );
        $this->post->setUserId( $postData->author );
    }

    public function getPostHtml(){
        if( strlen( $this->post->text ) <= 0 ):
            return '';
        endif;

        return '<blockquote><div class="bb_quoteauthor">Originally posted by <b><a href="' . $this->post->url . '">' . $this->post->uid . '</a></b></div>' . $this->post->text . '</blockquote>';
    }
}
