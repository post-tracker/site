<?php
include( '../includes/default.php' );

// http://steamcommunity.com/app/346110/discussions/0/594821545178546859/
$developers = array(
    array(
        'nick' => 'Jat',
        'name' => 'Jathiesh Karunakaran',
        'role' => 'Community Manager',
        'accounts' => array(
            'steam' => 'wildcardjat',
            'reddit' => 'jatonreddit',
            'twitter' => 'jatstweeter',
            'survivetheark' => '2-jat'
        )
    ),
    array(
        'nick' => 'The Right Hand',
        'name' => 'Kayd Hendricks',
        'role' => '',
        'accounts' => array(
            'steam' => '76561198175441809',
            'reddit' => 'WildcardTheRightHand',
            'twitter' => 'KaydHendricks',
            'survivetheark' => '3836-therighthand'
        )
    ),
    array(
        'nick' => 'The Left Hand',
        'name' => '',
        'role' => 'Designer',
        'accounts' => array(
            'steam' => '76561198178808059'
        )
    ),
    array(
        'nick' => 'Drake',
        'name' => '',
        'role' => 'Lead Engineer',
        'accounts' => array(
            'steam' => 'wildcarddrake',
            'reddit' => 'WC-Drake',
            'twitter' => 'arkjeremy',
            'survivetheark' => '4054-jeremy-stieglitz'
        )
    ),
    array(
        'nick' => 'Studio Wildcard',
        'name' => '',
        'role' => '',
        'accounts' => array(
            'steam' => '76561198207415608'
        )
    ),
    array(
        'nick' => 'Ark Dev Engineer',
        'name' => '',
        'role' => 'Engineer',
        'accounts' => array(
            'steam' => '76561198229320228'
        )
    ),
    array(
        'nick' => 'The Right Foot',
        'name' => '',
        'role' => 'Producer',
        'accounts' => array(
            'steam' => '76561198178797193'
        )
    ),
    array(
        'nick' => 'Jesse',
        'name' => 'Jesse Rapczak',
        'role' => 'Art Director',
        'accounts' => array(
            'steam' => '76561198174992766',
            'twitter' => 'arkjesse',
            'survivetheark' => '11-jesse'
        )
    ),
    array(
        'nick' => 'RawMeat',
        'name' => '',
        'role' => '',
        'accounts' => array(
            'steam' => '76561198212514456'
        )
    ),
    array(
        'nick' => 'OMoussa',
        'name' => '',
        'role' => '',
        'accounts' => array(
            'steam' => 'OMoussaInstinct'
        )
    ),
    array(
        'nick' => 'The Left Foot',
        'name' => '',
        'role' => '',
        'accounts' => array(
            'steam' => 'wcTLF'
        )
    ),
    array(
        'nick' => 'Boris Dos',
        'name' => '',
        'role' => 'Network Engineer',
        'accounts' => array(
            'steam' => '76561198179250147'
        )
    ),
    array(
        'nick' => 'HongleBongle',
        'name' => '',
        'role' => '',
        'accounts' => array(
            'steam' => 'HongleBongle',
            'reddit' => 'HongleBongleFungle'
        )
    ),
    array(
        'nick' => 'Jen',
        'name' => '',
        'role' => 'Community Manager',
        'accounts' => array(
            'steam' => 'wildcardjen',
            'reddit' => 'wildcardjen',
            'twitter' => 'bubblywums',
            'survivetheark' => '7-jen'
        ) 
    ),
    array(
        'nick' => 'Wildcard Casanova',
        'name' => '',
        'role' => 'Web & Video Producer',
        'accounts' => array(
            'twitter' => 'Explore_ARK',
            'survivetheark' => '3-casanova'
        ) 
    ),
    array(
        'nick' => 'Wildcard Zane',
        'name' => '',
        'role' => 'Head Bug Reports',
        'accounts' => array(
            'steam' => 'WildcardQA',
            'twitter' => 'WC_Zane',
            'survivetheark' => '6-zane'
        ) 
    ),
    array(
        'nick' => 'LilPanda',
        'name' => '',
        'role' => 'Community Hub Leader',
        'accounts' => array(
            'steam' => 'wildcardpanda',
            'reddit' => 'wildcardpanda',
            'twitter' => 'thelilpanda',
            'survivetheark' => '8-lilpanda'
        ) 
    )
);

// Create posts table if it doesn't exist
$tableExists = gettype( $database->exec( 'SELECT count(*) FROM posts LIMIT 1' ) ) == 'integer';
if( !$tableExists ):
    $query = 'CREATE TABLE posts( topic TEXT, topic_url TEXT, uid TEXT, url TEXT, source TEXT, content TEXT, timestamp TEXT )';
    $database->exec( $query );
endif;

// Create developers table if it doesn't exist
$tableExists = gettype( $database->exec( 'SELECT count(*) FROM developers LIMIT 1' ) ) == 'integer';
if( !$tableExists ):
    $query = 'CREATE TABLE developers( id INT PRIMARY KEY, nick TEXT, name TEXT, role TEXT )';
    $database->exec( $query );
endif;

// Create accounts table if it doesn't exist
$tableExists = gettype( $database->exec( 'SELECT count(*) FROM accounts LIMIT 1' ) ) == 'integer';
if( !$tableExists ):
    $query = 'CREATE TABLE accounts( uid INT, service TEXT, identifier TEXT )';
    $database->exec( $query );
endif;


// Database stuff for developer
$userExistsQuery = 'SELECT id FROM developers WHERE nick = :nick LIMIT 1';
$userExistsPDO = $database->prepare( $userExistsQuery );

$createUserQuery = 'INSERT INTO developers ( id, nick, name, role ) VALUES( :id, :nick, :name, :role )';
$createUserPDO = $database->prepare( $createUserQuery );

$updateUserQuery = 'UPDATE developers SET nick = :nick, name = :name, role = :role WHERE id = :id';
$updateUserPDO = $database->prepare( $updateUserQuery );

// Database stuff for accounts
$accountExistsQuery = 'SELECT COUNT(*) FROM accounts WHERE service = :service AND uid = :uid LIMIT 1';
$accountExistsPDO = $database->prepare( $accountExistsQuery );

$createAccountQuery = 'INSERT INTO accounts ( uid, service, identifier ) VALUES( :uid, :service, :identifier)';
$createAccountPDO = $database->prepare( $createAccountQuery );

$updateAccountQuery = 'UPDATE accounts SET identifier = :identifier WHERE uid = :uid AND service = :service';
$updateAccountPDO = $database->prepare( $updateAccountQuery );

// Current max value uid
$highetstUidPDO = $database->query( 'SELECT id FROM developers ORDER BY id DESC LIMIT 1' );
$highestUid = $highetstUidPDO->fetchColumn();

if( !$highestUid ) :
    $highestUid = 0;
endif;

foreach( $developers as $developer ) :
    $userExistsPDO->bindValue( ':nick', $developer[ 'nick' ] );
    $userExistsPDO->execute();

    $uid = $userExistsPDO->fetchColumn();
    if( $uid > 0 ) :
        // User already exists
        $updateUserPDO->bindValue( ':id', $uid );
        $updateUserPDO->bindValue( ':nick', $developer[ 'nick' ] );
        $updateUserPDO->bindValue( ':name', $developer[ 'name' ] );
        $updateUserPDO->bindValue( ':role', $developer[ 'role' ] );

        $updateUserPDO->execute();
    else :
        $uid = $highestUid + 1;
        // User doesn't exist
        $createUserPDO->bindValue( ':id', $uid );
        $createUserPDO->bindValue( ':nick', $developer[ 'nick' ] );
        $createUserPDO->bindValue( ':name', $developer[ 'name' ] );
        $createUserPDO->bindValue( ':role', $developer[ 'role' ] );

        $createUserPDO->execute();
    endif;

    $createAccountPDO->bindValue( ':uid', $uid );
    $updateAccountPDO->bindValue( ':uid', $uid );

    foreach( $developer[ 'accounts' ] as $service => $identifier ) :
        $accountExistsPDO->bindValue( ':service', $service );
        $accountExistsPDO->bindValue( ':uid', $uid );
        $accountExistsPDO->execute();

        if( $accountExistsPDO->fetchColumn() > 0 ) :
            // Account already exists
            $updateAccountPDO->bindValue( ':service', $service );
            $updateAccountPDO->bindValue( ':identifier', $identifier );
            $updateAccountPDO->execute();
        else :
            // Account doesn't exist
            $createAccountPDO->bindValue( ':service', $service );
            $createAccountPDO->bindValue( ':identifier', $identifier );
            $createAccountPDO->execute();
        endif;

    endforeach;

    $highestUid = $highestUid + 1;
endforeach;
