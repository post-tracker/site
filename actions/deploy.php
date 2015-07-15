<?php

// Use in the "Webhooks" section of your GitHub repo.

if( isset( $_SERVER[ 'HTTP_X_GITHUB_EVENT' ] ) && $_SERVER[ 'HTTP_X_GITHUB_EVENT' ] == 'push' ) :
    shell_exec( 'cd /usr/share/nginx/html/ && git reset --hard HEAD && git pull' );
endif;

?>hi
