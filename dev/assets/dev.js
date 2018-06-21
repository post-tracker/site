(function() {
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
