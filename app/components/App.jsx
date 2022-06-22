import React from 'react';

import { DarkModeSwitch } from 'react-toggle-dark-mode';
import PostListContainer from '../containers/PostListContainer.jsx';
import FiltersContainer from '../containers/FiltersContainer.jsx';

import useStateWithLocalStorage from '../hooks/useStateWithLocalStorage.jsx';

const App = () => {
    const [theme, setTheme] = useStateWithLocalStorage('theme', 'theme-light');

    const toggleDarkMode = (isDarkMode) => {
        const newTheme = isDarkMode ? 'theme-light' : 'theme-dark';
        setTheme(newTheme);
        const event = new CustomEvent('switch-theme', {
            detail: newTheme,
        });

        window.dispatchEvent(event);
    };

    return (
        <div>
            <DarkModeSwitch
                checked={theme === 'theme-light' ? true : false }
                onChange={toggleDarkMode}
                moonColor={'black'}
                sunColor={'white'}
                style={{
                    marginBottom: '2rem',
                    position: 'absolute',
                    top: '10px',
                }}
                size={24}
            />
            <FiltersContainer />
            <PostListContainer />
        </div>
    );
}

export default App;
