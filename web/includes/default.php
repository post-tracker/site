<?php
include( 'config.php' );

try {
    $database = new PDO( $databasePath );
} catch( PDOException $error ) {
    die( '<h2>Unable to open database connection</h2><p>'  . $error->getMessage() . '</p>');
}

$database->setAttribute( PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ );

function classAutoloader( $className ) {
    if( file_exists( __DIR__ . '/classes/' . $className . '.class.php' ) ) :
        include  __DIR__ . '/classes/' . $className . '.class.php';
    endif;
}

spl_autoload_register( 'classAutoloader' );

function getUid( $service, $identifier ){
    $query = 'SELECT uid FROM accounts WHERE service = :service AND identifier = :identifier LIMIT 1';
    $PDO = $database->prepare( $query );

    $PDO->bindValue( ':service', $service );
    $PDO->bindValue( ':identifier', $identifier );

    $PDO->execute();

    return $PDO->fetchColumn();
}

function parseRedditId( $unparsedRedditId ){
    return str_replace( array( 't1_', 't2_', 't3_' ), '', $unparsedRedditId );
}
