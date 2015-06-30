<?php
include( 'config.php' );

try {
    $database = new PDO( $databasePath );
} catch( PDOException $error ) {
    die( '<h2>Unable to open database connection</h2><p>'  . $error->getMessage() . '</p>');
}

// Create posts table if it doesn't exist
$tableExists = gettype( $database->exec( 'SELECT count(*) FROM posts LIMIT 1' ) ) == 'integer';
if( !$tableExists ):
    $query = 'CREATE TABLE posts( topic TEXT, topic_url TEXT, user TEXT, user_identifier TEXT, url TEXT, source TEXT, content TEXT, timestamp TEXT )';
    $database->exec( $query );
endif;

function __autoload( $className ) {
    include  'classes/' . $className . '.class.php';
}
