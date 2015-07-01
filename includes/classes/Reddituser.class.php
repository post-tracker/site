<?php
class Reddituser extends Kurl {
    private static $apiBase = 'http://www.reddit.com';
    private static $userCommentsUrl = '/user/{username}/comments.json';

    private $posts = array();

    public function __construct( $uid, $identifier ){
        $this->userId = $uid;
        $this->identifier = $identifier;
    }

    public function getRecentPosts(){
        $url = self::$apiBase . str_replace( '{username}', $this->identifier, self::$userCommentsUrl );
        $data = $this->loadUrl( $url );

        $posts = json_decode( $data );
        // Go over the recent posts
        foreach( $posts->data->children as $redditPost ) :
            $commentsUrl = 'http://www.reddit.com/r/' . $redditPost->data->subreddit . '/comments/';
            $commentsUrl = $commentsUrl . str_replace( 't3_', '', $redditPost->data->link_id ) . '/';

            $post = new Post();

            $post->setTimestamp( $redditPost->data->created_utc );
            $post->setTopic( $redditPost->data->link_title, $commentsUrl );
            $post->setText( $redditPost->data->body );
            $post->setUrl( $commentsUrl . '#' . $redditPost->data->id );
            $post->setUserId( $this->userId );

            $post->setSource( 'reddit' );

            $this->posts[] = $post;
        endforeach;

        return $this->posts;
    }
}
