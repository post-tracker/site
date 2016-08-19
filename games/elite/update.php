<?php
include( '../includes/default.php' );

switch( $_GET[ 'type' ] ):
    case 'reddit':
        $PDO = $database->query( 'SELECT uid, identifier FROM accounts WHERE service = "reddit"' );
        $users = $PDO->fetchAll();
        foreach( $users as $userData ) :
            $redditUser = new Reddituser( $userData->uid, $userData->identifier);

            $posts = $redditUser->getRecentPosts();
            foreach( $posts as $post ) :
                $post->save();
            endforeach;
        endforeach;
        break;

    case 'steam':
        $PDO = $database->query( 'SELECT uid, identifier FROM accounts WHERE service = "steam"' );
        $users = $PDO->fetchAll();
        foreach( $users as $userData ) :
            $steamProfile = new Steamprofile( $userData->uid, $userData->identifier );

            $posts = $steamProfile->getRecentPosts();
            foreach( $posts as $post ) :
                $post->save();
            endforeach;
        endforeach;
        break;
        
    case 'rss':
        $rssParser = new RSS( 'http://www.miggy.org/games/elite-dangerous/devtracker/ed-dev-posts.rss' );
        $posts = $rssParser->getRecentPosts();
        foreach( $posts as $post ) :
            $post->save();
        endforeach;
        break;
endswitch;
