<?php
include( '../includes/default.php' );

switch( $_GET[ 'type' ] ):
    case 'reddit':
        foreach( $redditProfiles as $identifier => $name ) :
            $redditUser = new Reddituser( $identifier, $name );

            $posts = $redditUser->getRecentPosts();

            foreach( $posts as $post ) :
                $post->save();
            endforeach;
        endforeach;
        break;

    case 'steam':
        foreach( $steamProfiles as $identifier => $name ) :
            $steamProfile = new Steamprofile( $identifier, $name );

            $posts = $steamProfile->getRecentPosts();
            foreach( $posts as $post ) :
                $post->save();
            endforeach;
        endforeach;
        break;
endswitch;
