/*!
 * express-csv
 * Copyright 2011 Seiya Konno <nulltask@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var http = require('http'),
    express = require('express'),
    res = express.response || http.ServerResponse.prototype,
    Iconv = require('iconv').Iconv;


/**
 * Import package information.
 */

var package = require('../package');

/**
 * Library version.
 */

exports.version = package.version;

/**
 * CSV separator
 */

exports.separator = ',';

/**
 * Prevent Excel's casting.
 */

exports.preventCast = false;

/**
 * Ignore `null` or `undefined`
 */

exports.ignoreNullOrUndefined = true;

var UTF8_BOM = '\xEF\xBB\xBF';

var DEFAULT_CHARSET = 'utf-8';

/**
 * Escape CSV field
 *
 * @param {Mixed} field
 * @return {String}
 * @api private
 */

function escape(field) {
  if (exports.ignoreNullOrUndefined && (field === undefined || field === null)) {
    return '';
  }
  if (exports.preventCast) {
    return '="' + String(field).replace(/\"/g, '""') + '"';
  }
  return '"' + String(field).replace(/\"/g, '""') + '"';
}

/**
 * Convert an object to an array of property values.
 *
 * Example:
 *    objToArray({ name: "john", id: 1 })
 *    // => [ "john", 1 ]
 *
 * @param {Object} obj The object to convert.
 * @return {Array} The array of object properties.
 * @api private
 */

function objToArray(obj) {
  var result = [];
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      result.push(obj[prop]);
    }
  }
  return result;
}

/**
 * Send CSV response with `obj`, optional `headers`, and optional `status`.
 *
 * @param {Array} obj
 * @param {Object|Number} headers or status
 * @param {Number} status
 * @return {ServerResponse}
 * @api public
 */

res.csv = function(obj, headers, status) {
  var body = '';

  this.charset = DEFAULT_CHARSET;
  this.header('Content-Type', 'text/csv');

  obj.forEach(function(item) {
    if (!(item instanceof Array)) item = objToArray(item);
    body += item.map(escape).join(exports.separator) + '\r\n';
  });

  var conv = new Iconv(DEFAULT_CHARSET, this.charset);
  var newBuffer = Buffer.concat([new Buffer(UTF8_BOM), new Buffer(body, this.charset)]);
  var convertedBody = conv.convert(newBuffer);

  return this.send(convertedBody, headers, status);
};
