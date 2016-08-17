<?php
include( '../includes/default.php' );

$fetchQuery = 'SELECT developers.id, accounts.uid, accounts.identifier, developers.active FROM developers, accounts WHERE developers.active = 1 AND developers.id = accounts.uid AND accounts.service = :service';
$PDO = $database->prepare( $fetchQuery );

switch( $_GET[ 'type' ] ):
    case 'reddit':
        $PDO->bindValue( ':service', 'reddit' );
        $PDO->execute();
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
        $PDO->bindValue( ':service', 'steam' );
        $PDO->execute();
        $users = $PDO->fetchAll();
        foreach( $users as $userData ) :
            $steamProfile = new Steamprofile( $userData->uid, $userData->identifier );

            $posts = $steamProfile->getRecentPosts();
            foreach( $posts as $post ) :
                $post->save();
            endforeach;
        endforeach;
        break;
endswitch;
