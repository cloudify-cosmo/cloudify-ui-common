import resolve from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const extensions = ['.js', '.ts'];
const getBabelPluginConfig = transpile => ({
    presets: [transpile && '@babel/preset-env', '@babel/preset-typescript'].filter(Boolean),
    exclude: 'node_modules/**',
    extensions,
    babelHelpers: 'bundled'
});

export default [
    // browser-friendly UMD build - ES5
    {
        input: 'src/index.js',
        output: {
            name: 'cloudifyUiCommon',
            file: pkg.browser,
            format: 'umd',
            sourcemap: true
        },
        plugins: [commonjs(), babel(getBabelPluginConfig(true)), resolve({ extensions }), terser()]
    },

    // CommonJS (for Node) and ES module (for bundlers) build.
    // (We could have three entries in the configuration array
    // instead of two, but it's quicker to generate multiple
    // builds from a single configuration where possible, using
    // an array for the `output` option, where we can specify
    // `file` and `format` for each target)
    {
        input: 'src/index.js',
        output: [
            { file: pkg.main, format: 'cjs' },
            { file: pkg.module, format: 'es' }
        ],
        plugins: [babel(getBabelPluginConfig(false)), resolve({ extensions })]
    }
];
