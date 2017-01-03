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
    $countQuery = 'SELECT
        COUNT(*) AS accountCount
    FROM
        accounts
    WHERE
        service = :service';

    $countPDO = $database->prepare( $countQuery );
    $countPDO->bindValue( ':service', $type );
    $countPDO->execute();
    $accountCount = $countPDO->fetchColumn();

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

    $updateUsers = array_chunk( $users, ceil( $accountCount / 2 ) );

    shuffle( $updateUsers );

    foreach( $updateUsers[ 0 ] as $userData ) :
        $developerService = new $className( $userData->uid, $userData->identifier, $serviceData );
        $posts = $developerService->getRecentPosts();
        foreach( $posts as $post ) :
            $post->save( $serviceData );
        endforeach;
    endforeach;
endif;
