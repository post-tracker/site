<?php
include( 'includes/default.php' );

$hasSearch = false;
$hasGroups = false;
$hasServices = false;

if( isset( $_GET[ 'search' ] ) && strlen( $_GET[ 'search' ] ) > 0 ) :
    $hasSearch = true;
endif;

if( isset( $_GET[ 'groups' ] ) && count( $_GET[ 'groups' ] ) > 0 ):
    $hasGroups = true;
endif;

if( isset( $_GET[ 'services' ] ) && count( $_GET[ 'services' ] ) > 0 ):
    $hasServices = true;
endif;

if ( !isset( $_GET[ 'type' ] ) && !$hasSearch ):
    $query = 'SELECT
            accounts.identifier,
            developers.`group`,
            developers.name,
            developers.nick,
            developers.role,
            posts.content,
            posts.source,
            posts.timestamp,
            posts.topic_url,
            posts.topic,
            posts.url
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
        {devGroup}
        {serviceGroup}
        ORDER BY
            posts.timestamp
        DESC
        LIMIT
            50';

    if ( $hasGroups ):
        $replaceString = 'AND developers.`group` IN (' . implode( ',', array_fill( 0, count( $_GET[ 'groups' ] ), ' ?' )  ) . ' )';
        $query = str_replace( '{devGroup}', $replaceString, $query );
    else :
        $query = str_replace( '{devGroup}', '', $query );
    endif;

    if ( $hasServices ):
        $serviceIndexCount = count( $_GET[ 'services' ] );

        if( $hasGroups ) {
            $serviceOffset = count( $_GET[ 'groups' ] );
        } else {
            $serviceOffset = 0;
        }

        $replaceString = 'AND posts.source IN (' . implode( ',', array_fill( 0, $serviceIndexCount, ' ?' )  ) . ' )';
        $query = str_replace( '{serviceGroup}', $replaceString, $query );
    else :
        $query = str_replace( '{serviceGroup}', '', $query );
    endif;

    $PDO = $database->prepare( $query );

    if( $hasGroups ):
        foreach ( $_GET[ 'groups' ] as $i => $groupName ):
            $PDO->bindValue( ( $i + 1 ), $groupName );
        endforeach;
    endif;

    if( $hasServices ):
        foreach ( $_GET[ 'services' ] as $i => $serviceName ):
            $PDO->bindValue( ( $i + 1 + $serviceOffset), $serviceName );
        endforeach;
    endif;

    $PDO->execute();
    $posts = $PDO->fetchAll();

    header( 'Content-Type: application/json' );
    die( json_encode( $posts ) );
endif;

if( $hasSearch ):
    $query = 'SELECT
        accounts.identifier,
        developers.`group`,
        developers.name,
        developers.nick,
        developers.role,
        posts.content,
        posts.source,
        posts.timestamp,
        posts.topic_url,
        posts.topic,
        posts.url
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
            posts.topic LIKE ?
            OR
            posts.content LIKE ?
            OR
            developers.nick LIKE ?
            OR
            developers.role LIKE ?
        )
    {devGroup}
    {serviceGroup}
    ORDER BY
        posts.timestamp
    DESC
    LIMIT
        50';

    if ( $hasGroups ):
        $replaceString = 'AND developers.`group` IN (' . implode( ',', array_fill( 0, count( $_GET[ 'groups' ] ), ' ?' )  ) . ' )';
        $query = str_replace( '{devGroup}', $replaceString, $query );
    else :
        $query = str_replace( '{devGroup}', '', $query );
    endif;

    if ( $hasServices ):
        $replaceString = 'AND posts.source IN (' . implode( ',', array_fill( 0, count( $_GET[ 'services' ] ), ' ?' )  ) . ' )';
        $query = str_replace( '{serviceGroup}', $replaceString, $query );
    else :
        $query = str_replace( '{serviceGroup}', '', $query );
    endif;

    $PDO = $database->prepare( $query );

    $paramCount = 1;
    $searchString = '%' . $_GET[ 'search' ] . '%';

    // Bind all search types
    while( $paramCount < 5 ):
        $PDO->bindParam( $paramCount, $searchString );
        $paramCount = $paramCount + 1;
    endwhile;

    if( $hasGroups ):
        foreach ( $_GET[ 'groups' ] as $i => $groupName ):
            $PDO->bindValue( $paramCount, $groupName );
            $paramCount = $paramCount + 1;
        endforeach;
    endif;

    if( $hasServices ):
        foreach ( $_GET[ 'services' ] as $i => $serviceName ):
            $PDO->bindValue( $paramCount, $serviceName );
            $paramCount = $paramCount + 1;
        endforeach;
    endif;

    $PDO->execute();
    $posts = $PDO->fetchAll();

    header( 'Content-Type: application/json' );
    die( json_encode( $posts ) );
endif;

switch ( $_GET[ 'type' ] ):
    case 'groups':
        $query = 'SELECT
            `group`,
            COUNT(`group`) AS devs
            FROM
                developers
            WHERE
                `group`
            IS NOT NULL
            GROUP BY
                `group`';

        $PDO = $database->prepare( $query );
        $PDO->execute();
        $posts = $PDO->fetchAll();

        $groups = [];

        if( !isset( $minimumDevelopers ) ):
            $minimumDevelopers = 1;
        endif;

        foreach( $posts as $post ):
            if( $post->devs < $minimumDevelopers ):
                continue;
            endif;

            $groups[] = $post->group;
        endforeach;

        sort( $groups, SORT_NATURAL | SORT_FLAG_CASE );

        header( 'Content-Type: application/json' );
        die( json_encode( $groups ) );
    case 'services':
        $query = 'SELECT
            `source` AS service
            FROM
                posts
            WHERE
                `source`
            IS NOT NULL
            GROUP BY
                `source`';

        $PDO = $database->prepare( $query );
        $PDO->execute();
        $posts = $PDO->fetchAll();

        $services = [];

        foreach( $posts as $post ):
            $services[] = $post->service;
        endforeach;

        sort( $services, SORT_NATURAL | SORT_FLAG_CASE );

        header( 'Content-Type: application/json' );
        die( json_encode( $services ) );
endswitch;
