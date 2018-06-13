(function(){
    const cookieIsDark = function cookieIsDark() {
        return document.cookie.split( ';' ).filter( ( item ) => {
            return item.includes( 'dark=1' )
        } ).length;
    };

    if ( cookieIsDark() ) {
        document.querySelector( 'body' ).classList.add( 'dark-mode' );
    }

    window.addEventListener( 'click', function( event ) {
        if ( event.target.classList.contains( 'dark-mode-toggle' ) ) {
            const body = document.querySelector( 'body' );

            if ( !body.classList.contains( 'dark-mode' ) ) {
                body.classList.add( 'dark-mode' );

                if ( !cookieIsDark() ) {
                    document.cookie = document.cookie + 'dark=1;';
                }
            } else {
                body.classList.remove( 'dark-mode' );

                if ( cookieIsDark() ){
                    document.cookie = document.cookie.replace( 'dark=1', 'dark=0' );
                }
            }
        }
    } );

    window.fetch( 'https://api.developertracker.com/games' )
        .then( ( response ) => {
            return response.json();
        } )
        .then( ( games ) => {
            let gameSelectString = '<ul class="dev-game-select">';
            const sortedGames = games.data.sort( ( a, b ) => {
                return a.name.localeCompare( b.name );
            } );

            for ( let i = 0; i < sortedGames.length; i = i + 1 ) {
                gameSelectString = `${ gameSelectString }<li><a href="/${ sortedGames[ i ].identifier }/">${ sortedGames[ i ].name }</a></li>`;
            }

            gameSelectString = `${ gameSelectString }</ul>`;

            const wrapper = document.createElement( 'div' );
            wrapper.className = 'dev-game-select-wrapper';
            wrapper.innerHTML = gameSelectString;

            document.querySelectorAll( 'body' )[ 0 ].appendChild( wrapper );
        } )
        .catch( ( requestError ) => {
            throw requestError;
        } );
})();
