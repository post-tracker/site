(function() {
    let currentTheme;

    const getCurrentTheme =
        () => localStorage.getItem( 'theme' ) || 'theme-light';

    const setTheme =
        ( theme ) => {
            if( !currentTheme )
                return;

            const bodyClasses = document.querySelector( 'body' ).classList;
            bodyClasses.remove( currentTheme );
            bodyClasses.add( theme );

            document.getElementById( 'theme-style' ).href = `./assets/${theme}.css`;
            localStorage.setItem( 'theme', theme );
            
            currentTheme = theme;
        };

    setTheme( currentTheme = getCurrentTheme() );

    document.querySelector( '.dark-mode-toggle' ).addEventListener( 'click', function( event ) {
        event.preventDefault();
        setTheme( currentTheme === 'theme-dark'? 'theme-light': 'theme-dark' );
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
