<?php
include( '../includes/default.php' );

$hasSearch = false;
$hasGroups = false;

if( isset( $_GET[ 'search' ] ) && strlen( $_GET[ 'search' ] ) > 0 ) :
    $hasSearch = true;
endif;

if( isset( $_GET[ 'groups' ] ) && count( $_GET[ 'groups' ] ) > 0 ):
    $hasGroups = true;
endif;

if ( !isset( $_GET[ 'type' ] ) ):
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

    $PDO = $database->prepare( $query );

    if( $hasGroups ):
        foreach ( $_GET[ 'groups' ] as $i => $groupName ):
            $PDO->bindValue( ( $i + 1 ), $groupName );
        endforeach;
    endif;

    $PDO->execute();
    $posts = $PDO->fetchAll();

    header( 'Content-Type: application/json' );
    die( json_encode( $posts ) );
endif;

switch ( $_GET[ 'type' ] ):
    case 'search':
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
                ORDER BY
                    posts.timestamp
                DESC
                LIMIT
                    50';
        elseif( $hasGroups ):
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
                ORDER BY
                    posts.timestamp
                DESC
                LIMIT
                    50';
        endif;

        if( !$query ):
            die( 'Somethings fucky' );
        endif;

        if ( $hasGroups ):
            $replaceString = 'AND developers.`group` IN (' . implode( ',', array_fill( 0, count( $_GET[ 'groups' ] ), ' ?' )  ) . ' )';
            $query = str_replace( '{devGroup}', $replaceString, $query );
        else :
            $query = str_replace( '{devGroup}', '', $query );
        endif;

        $PDO = $database->prepare( $query );

        $paramCount = 1;

        if( $hasSearch ):
            $searchString = '%' . $_GET[ 'search' ] . '%';

            // Bind all search types
            while( $paramCount < 5 ):
                $PDO->bindParam( $paramCount, $searchString );
                $paramCount = $paramCount + 1;
            endwhile;
        endif;

        if( $hasGroups ):
            foreach ( $_GET[ 'groups' ] as $i => $groupName ):
                $PDO->bindValue( ( $i + $paramCount ), $groupName );
            endforeach;
        endif;


        $PDO->execute();
        $posts = $PDO->fetchAll();

        header( 'Content-Type: application/json' );
        die( json_encode( $posts ) );
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
endswitch;
