/**
 * Rollup configuration for packaging the plugin in a module that is consumable
 * by either CommonJS (e.g. Node or Browserify) or ECMAScript (e.g. Rollup).
 *
 * These modules DO NOT include their dependencies as we expect those to be
 * handled by the module system.
 */
import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';

export default {
  name: 'videojsHlsQualitySelector',
  input: 'src/plugin.js',
  output: [{
    file: 'dist/videojs-hls-quality-selector.cjs.js',
    format: 'cjs'
  }, {
    file: 'dist/videojs-hls-quality-selector.es.js',
    format: 'es'
  }],
  external: [
    'global',
    'global/document',
    'global/window',
    'video.js'
  ],
  globals: {
    'video.js': 'videojs'
  },
  plugins: [
    json(),
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      presets: [
        ['es2015', {
          loose: true,
          modules: false
        }]
      ],
      plugins: [
        'external-helpers',
        'transform-object-assign'
      ]
    })
  ]
};
