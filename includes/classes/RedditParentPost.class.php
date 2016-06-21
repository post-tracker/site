<?php
class RedditParentPost extends Kurl {
    private static $apiBase = 'https://www.reddit.com';
    private static $singleCommentUrl = '/comments/{topicid}/{commentid}.json';

    public function __construct( $topicid, $commentid ){
        $this->id = $commentid;
        $this->topicid = $topicid;

        $this->load();
    }

    private function load(){
        $url = self::$apiBase . str_replace( array( '{topicid}', '{commentid}' ), array( $this->topicid, $this->id ), self::$singleCommentUrl );
        // This we can store a month, it will not change
        $this->rawData = json_decode( $this->loadUrl( $url, 2592000 ) );

        if( !isset( $this->rawData[ 1 ]->data->children[ 0 ]->data ) ) :
            // print_r( $this->rawData );
            return false;
        endif;

        $parentData = $this->rawData[ 0 ]->data->children[ 0 ]->data;
        foreach( $this->rawData[ 1 ]->data->children as $post ):
            if( $post->data->id == $this->id ) :
                $postData = $post->data;
            endif;
        endforeach;

        $urlParts = array_filter( explode( '/', $parentData->permalink ), 'strlen' );
        $this->topic = end( $urlParts );

        if( !isset( $postData ) ) :
            return false;
        endif;

        $this->post = new Post();
        $this->post->setTimestamp( $postData->created_utc );
        $text = html_entity_decode( $postData->body_html );
        $text = preg_replace( '#href="/([ur])/#', 'href="https://reddit.com/$1/', $text );
        $this->post->setText( $text );
        $this->post->setUrl( self::$apiBase . $parentData->permalink . $this->id . '#' . $this->id );
        $this->post->setUserId( $postData->author );
    }

    public function getPostHtml(){
        return '<blockquote><div class="bb_quoteauthor">Originally posted by <b><a href="' . $this->post->url . '">' . $this->post->uid . '</a></b></div>' . $this->post->text . '</blockquote>';
    }
}
