import { useEffect, useState } from 'react';

const useStateWithLocalStorage = (localStorageKey, fallbackValue) => {
    let initialValue = localStorage.getItem(localStorageKey);

    if (initialValue === null) {
        initialValue = fallbackValue;
    } else {
        try {
            initialValue = JSON.parse(initialValue);
        } catch (jsonParseError) {
            // If we have something non-json in local storage, fall back to fallback value
            initialValue = fallbackValue;
        }
    }

    const [value, setValue] = useState(initialValue);
    
    useEffect(() => {
        localStorage.setItem(localStorageKey, JSON.stringify(value));
    }, [value, localStorageKey]);

    return [value, setValue];
};

export default useStateWithLocalStorage;