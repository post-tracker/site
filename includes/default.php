<?php
include( 'config.php' );

try {
    $database = new PDO( $databasePath );
} catch( PDOException $error ) {
    die( '<h2>Unable to open database connection</h2><p>'  . $error->getMessage() . '</p>');
}

$database->setAttribute( PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ );

function __autoload( $className ) {
    include  'classes/' . $className . '.class.php';
}

function getUid( $service, $identifier ){
    $query = 'SELECT uid FROM accounts WHERE service = :service AND identifier = :identifier LIMIT 1';
    $PDO = $database->prepare( $query );

    $PDO->bindValue( ':service', $service );
    $PDO->bindValue( ':identifier', $identifier );

    $PDO->execute();

    return $PDO->fetchColumn();
}
