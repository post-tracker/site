<?php
include( 'includes/default.php' );

$validTypesQuery = 'SELECT service FROM accounts GROUP BY service';
$PDO = $database->prepare( $validTypesQuery );
$PDO->execute();
$validServices = $PDO->fetchAll( PDO::FETCH_COLUMN, 0 );

if( !in_array( $_GET[ 'type' ], $validServices ) ):
    die( 'No valid service specified' );
endif;

$type = $_GET[ 'type' ];

$classExists = true;
if( !class_exists( $type ) ):
    $classExists = false;

    if( isset( $$type ) && isset( $$type[ 'class' ] ) ):
        if( class_exists( $$type[ 'class' ] ) ):
            $classExists = true;
        endif;
    endif;
endif;

if( !$classExists ):
    die( 'No class defined for ' . htmlentities( $type ) );
endif;

if( isset( $$type ) ):
    $serviceData = $$type;
else :
    $serviceData = array(
        'type' => 'multiple'
    );
endif;

$serviceData[ 'identifier' ] = $type;

$className = $type;
if( isset( $$type[ 'class' ] ) ):
    $className = $$type[ 'class' ];
endif;

if( isset( $serviceData[ 'type' ] ) && $serviceData[ 'type' ] == 'single' ):
    $developerService = new $className( $serviceData[ 'endpoint' ] );

    $posts = $developerService->getRecentPosts();
    foreach( $posts as $post ) :
        $post->save();
    endforeach;
else :
    $fetchQuery = 'SELECT
        developers.id,
        accounts.uid,
        accounts.identifier,
        developers.active
    FROM
        developers,
        accounts
    WHERE
        developers.active = 1
    AND
        developers.id = accounts.uid
    AND
        accounts.service = :service';

    $PDO = $database->prepare( $fetchQuery );
    $PDO->bindValue( ':service', $type );
    $PDO->execute();
    $users = $PDO->fetchAll();

    foreach( $users as $userData ) :
        $developerService = new $className( $userData->uid, $userData->identifier, $serviceData );
        $posts = $developerService->getRecentPosts();
        foreach( $posts as $post ) :
            $post->save( $serviceData );
        endforeach;
    endforeach;
endif;
