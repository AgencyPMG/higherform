import { jsdom } from 'jsdom';

global.chai = require('chai')
global.expect = chai.expect;
global.assert = chai.assert;
global.TestUtils = require('react-addons-test-utils');
global.Simulate = global.TestUtils.Simulate;
global.React = require('react');
global.document = jsdom('<doctype! html><html><body></body></html>');
global.window = global.document.defaultView;
global.navigator = global.window.navigator;
