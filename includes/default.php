<?php
// http://steamcommunity.com/app/346110/discussions/0/594821545178546859/
$steamProfiles = array(
    '76561198175441809' => 'TheRightHand',
    '76561198178808059' => 'TheLeftHand',
    'wildcarddrake' => 'Drake',
    'wildcardjat' =>  'Jat',
    '76561198207415608' => 'StudioWildcard',
    '76561198229320228' => 'ArkDevEngineer',
    '76561198178797193' => 'TheRightFoot',
    '76561198174992766' => 'Jesse Rapczak'
);

$redditProfiles = array(
    'jatonreddit' => 'Jat',
    'WildcardTheRightHand' => 'TheRightHand'
);

$twitterProfiles = array(
    'jatstweeter' => 'Jat',
    'KaydHendricks' => 'TheRightHand'
);

$roles = array(
    'Jat' => 'Community Manager',
    'Drake' => 'Lead Engineer',
    'TheLeftHand' => 'Designer',
    'ArkDevEngineer' => 'Engineer',
    'TheRightFoot' => 'Producer',
    'Jesse Rapczak' => 'Art Director'
);

$databasePath = 'sqlite:' . __DIR__ . '/../data/arkdevtracker.sqlite';

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

function sortByTimestamp( $a, $b ){
    if( $a->timestamp > $b->timestamp ) :
        return -1;
    elseif( $a->timestamp < $b->timestamp ):
        return 1;
    endif;

    return 0;
}
