import React from 'react';

const styles = {
    image: {
        maxWidth: '25%',
        width: 200,
    },
    wrapper: {
        textAlign: 'center',
    },
};

class Loader extends React.Component {
    render () {
        if ( !this.props.isFetching ) {
            return null;
        }

        return (
            <div
               style = { styles.wrapper }
           >
               <img
                   className = { 'loader' }
                   src = { 'assets/loader.svg?v=2' }
                   style = { styles.image }
               />
           </div>
        )
    }
}

export default Loader;
