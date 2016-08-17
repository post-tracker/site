<?php
class Reddituser extends Kurl {
    private static $apiBase = 'https://www.reddit.com';
    private static $userPostsUrl = '/user/{username}.json';

    private $posts = array();

    public function __construct( $uid, $identifier ){
        $this->userId = $uid;
        $this->identifier = $identifier;
    }

    public function getRecentPosts(){
        $this->loadPosts();

        return $this->posts;
    }

    private function loadPosts(){
        $url = self::$apiBase . str_replace( '{username}', $this->identifier, self::$userPostsUrl );
        $data = $this->loadUrl( $url );

        $posts = json_decode( $data );

        // Go over the recent posts
        foreach( $posts->data->children as $redditPost ) :
            $post = new Post();

            switch ( $redditPost->kind ) :
                case 't1':
                    $commentsUrl = 'https://www.reddit.com/r/' . $redditPost->data->subreddit . '/comments/';
                    $commentsUrl = $commentsUrl . parseRedditId( $redditPost->data->link_id ) . '/';

                    $post->setTopic( $redditPost->data->link_title, $commentsUrl );

                    $parentPost = new RedditParentPost( parseRedditId( $redditPost->data->link_id ), parseRedditId( $redditPost->data->parent_id ) );

                    // If we fail to load it, just do it the next time instead
                    if( !isset( $parentPost->post ) ) :
                        continue;
                    endif;

                    $text = html_entity_decode( $redditPost->data->body_html );
                    $text = preg_replace( '#href="/([ur])/#', 'href="https://reddit.com/$1/', $text );

                    $post->setText( $parentPost->getPostHtml() . $text );
                    $post->setUrl( $commentsUrl . '' . $parentPost->topic . '/' . $redditPost->data->id . '#' . $redditPost->data->id );
                    break;
                case 't3':
                    $post->setTopic( $redditPost->data->title, $redditPost->data->url );
                    $post->setText( html_entity_decode( $redditPost->data->selftext_html ) );
                    $post->setUrl( $redditPost->data->url );
                    break;
            endswitch;

            $post->setTimestamp( $redditPost->data->created_utc );
            $post->setUserId( $this->userId );

            $post->setSource( 'reddit' );

            if( $post->isValid() ) :
                $this->posts[] = $post;
            endif;
        endforeach;
    }
}
