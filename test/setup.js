import { JSDOM } from 'jsdom';
import chai from 'chai';
import TestUtils from 'react-dom/test-utils';
import React from 'react';

global.chai = chai;
global.expect = chai.expect;
global.assert = chai.assert;
global.TestUtils = TestUtils 
global.Simulate = global.TestUtils.Simulate;
global.React = React;
global.dom = new JSDOM('<doctype! html><html><body></body></html>');
global.window = global.dom.window;
global.document = global.window.document;
