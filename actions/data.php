<?php
include( '../includes/default.php' );

$query = 'SELECT * FROM posts ORDER BY timestamp DESC LIMIT 100';
$PDO = $database->prepare( $query );
$PDO->execute();

$posts = $PDO->fetchAll( PDO::FETCH_CLASS, 'stdClass' );

foreach( $posts as $key => $post ) :
    if( isset( $roles[ $post->user ] ) ) :
        $posts[ $key ]->user_role = $roles[ $post->user ];
    endif;
endforeach;

header( 'Content-Type: application/json' );
die( json_encode( $posts ) );
