const js = require( '@eslint/js' );
const globals = require( 'globals' );
const reactPlugin = require( 'eslint-plugin-react' );

module.exports = [
    {
        ignores: [
            'node_modules/**',
            'web/**',
            'dev/**',
            'stage/**',
            'games/**',
        ],
    },
    js.configs.recommended,
    {
        // React frontend — ES modules + JSX, browser globals.
        files: [ 'app/**/*.{js,jsx}' ],
        plugins: {
            react: reactPlugin,
        },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            ...reactPlugin.configs.flat.recommended.rules,
            'react/prop-types': 'off',
        },
    },
    {
        // Build scripts + config — CommonJS, node globals.
        files: [ 'scripts/**/*.js', '*.js' ],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
            },
        },
    },
    {
        // Cloudflare Pages Functions — ES modules, Workers runtime globals.
        files: [ 'functions/**/*.js' ],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.serviceworker,
                Response: 'readonly',
                Request: 'readonly',
                URL: 'readonly',
            },
        },
    },
];
