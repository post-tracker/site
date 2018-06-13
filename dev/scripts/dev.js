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
})();
