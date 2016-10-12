import React from 'react';

const styles = {
    wrapper: {
        textAlign: 'center',
    },
};

class Loader extends React.Component {
    render () {
        return (
            <div
                style = { styles.wrapper }
            >
                <img
                    className = { 'loader' }
                    src = { 'assets/loader.svg' }
                />
            </div>
        );
    }
}

export default Loader;
