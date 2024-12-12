const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
    const config = await createExpoWebpackConfigAsync(env, argv);

    // Add fallback for native-only modules
    config.resolve.alias['react-native-maps'] = 'react-native-web';
    config.resolve.alias['react-native-maps-directions'] = 'react-native-web';
    config.resolve.alias['react-native$'] = 'react-native-web';

    // Optionally, add fallback for 'Platform' if needed
    config.resolve.alias['../../Utilities/Platform'] = 'react-native-web/dist/exports/Platform';

    // Ensure file extensions are properly resolved
    config.resolve.extensions = [
        '.web.ts',
        '.web.tsx',
        '.web.js',
        '.web.jsx',
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
        '.json',
    ];

    // Add any customizations for static rendering if required
    config.module.rules.push({
        test: /\.html$/,
        use: ['html-loader'],
    });

    return config;
};
