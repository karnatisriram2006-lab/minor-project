const React = require('react');
const ReactDOMServer = require('react-dom/server');
require('babel-register')({
  presets: ['@babel/preset-react', '@babel/preset-env', '@babel/preset-typescript']
});
// This is too complex because of Next.js imports and TS.
