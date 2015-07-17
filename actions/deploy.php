<?php

// Use in the "Webhooks" section of your GitHub repo.

if( isset( $_SERVER[ 'HTTP_X_GITHUB_EVENT' ] ) && $_SERVER[ 'HTTP_X_GITHUB_EVENT' ] == 'push' ) :
    echo 'Site updated', shell_exec( 'cd /usr/share/nginx/html/ && git reset --hard HEAD && git pull' );
else :
    echo 'Missing or unset parameters';
endif;
