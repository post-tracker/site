<?php
include( 'includes/default.php' );

$couch = new Couch( 'localhost:5984' );

print_r( $couch->getLatestPosts() );
