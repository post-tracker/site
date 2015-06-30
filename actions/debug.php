<?php
include( '../includes/default.php' );

$query = 'SELECT * FROM posts ORDER BY timestamp ASC';
$PDO = $database->prepare( $query );
$PDO->execute();

print_r( $PDO->fetchAll( PDO::FETCH_CLASS, 'stdClass' ) );
