<?php
include( '../includes/default.php' );

if( isset( $_GET[ 'search' ] ) && strlen( $_GET[ 'search' ] ) > 0 ) :
    $query = 'SELECT
            posts.topic,
            posts.topic_url,
            posts.url,
            posts.content,
            posts.timestamp,
            developers.nick,
            developers.role,
            accounts.identifier,
            posts.source
        FROM
            posts,
            developers,
            accounts
        WHERE
            developers.id = posts.uid
        AND
            accounts.uid = posts.uid
        AND
            accounts.service = posts.source
        AND
            (
                posts.topic LIKE :query
                OR
                posts.content LIKE :query
                OR
                developers.nick LIKE :query
                OR
                developers.role LIKE :query
            )
        ORDER BY
            posts.timestamp
        DESC
        LIMIT
            100';

    $PDO = $database->prepare( $query );
    $PDO->bindValue( ':query', '%' . $_GET[ 'search' ] . '%' );
else :
    $query = 'SELECT
            posts.topic,
            posts.topic_url,
            posts.url,
            posts.content,
            posts.timestamp,
            developers.nick,
            developers.role,
            accounts.identifier,
            posts.source
        FROM
            posts,
            developers,
            accounts
        WHERE
            developers.id = posts.uid
        AND
            accounts.uid = posts.uid
        AND
            accounts.service = posts.source
        ORDER BY
            posts.timestamp
        DESC
        LIMIT
            50';
    $PDO = $database->prepare( $query );
endif;

$PDO->execute();
$posts = $PDO->fetchAll();

header( 'Content-Type: application/json' );
die( json_encode( $posts ) );
