<?php
include( '../includes/default.php' );

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
        100';
$PDO = $database->prepare( $query );
$PDO->execute();

$posts = $PDO->fetchAll();

header( 'Content-Type: application/json' );
die( json_encode( $posts ) );
