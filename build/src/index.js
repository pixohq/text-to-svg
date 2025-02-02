"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var opentype = _interopRequireWildcard(require("opentype.js"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { "default": e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n["default"] = e, t && t.set(e, n), n; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * Copyright (c) 2016 Hideki Shiro
 */
// Browser bundlers might not have path or __dirname. Make DEFAULT_FONT optional
var DEFAULT_FONT = '';
try {
  DEFAULT_FONT = require('path').join(__dirname, '../fonts/ipag.ttf'); // eslint-disable-line global-require
} catch (e) {
  DEFAULT_FONT = '';
}

// Private method

function parseAnchorOption(anchor) {
  var horizontal = anchor.match(/left|center|right/gi) || [];
  horizontal = horizontal.length === 0 ? 'left' : horizontal[0];
  var vertical = anchor.match(/baseline|top|bottom|middle/gi) || [];
  vertical = vertical.length === 0 ? 'baseline' : vertical[0];
  return {
    horizontal: horizontal,
    vertical: vertical
  };
}
var TextToSVG = exports["default"] = /*#__PURE__*/function () {
  function TextToSVG(font) {
    _classCallCheck(this, TextToSVG);
    this.font = font;
  }
  _createClass(TextToSVG, [{
    key: "getWidth",
    value: function getWidth(text, options) {
      var fontSize = options.fontSize || 72;
      var kerning = 'kerning' in options ? options.kerning : true;
      var fontScale = 1 / this.font.unitsPerEm * fontSize;
      var width = 0;
      var glyphs = this.font.stringToGlyphs(text);
      for (var i = 0; i < glyphs.length; i++) {
        var glyph = glyphs[i];
        if (glyph.advanceWidth) {
          width += glyph.advanceWidth * fontScale;
        }
        if (kerning && i < glyphs.length - 1) {
          var kerningValue = this.font.getKerningValue(glyph, glyphs[i + 1]);
          width += kerningValue * fontScale;
        }
        if (options.letterSpacing) {
          width += options.letterSpacing * fontSize;
        } else if (options.tracking) {
          width += options.tracking / 1000 * fontSize;
        }
      }
      return width;
    }
  }, {
    key: "getHeight",
    value: function getHeight(fontSize) {
      var fontScale = 1 / this.font.unitsPerEm * fontSize;
      return (this.font.ascender - this.font.descender) * fontScale;
    }
  }, {
    key: "getMetrics",
    value: function getMetrics(text) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var fontSize = options.fontSize || 72;
      var anchor = parseAnchorOption(options.anchor || '');
      var width = this.getWidth(text, options);
      var height = this.getHeight(fontSize);
      var fontScale = 1 / this.font.unitsPerEm * fontSize;
      var ascender = this.font.ascender * fontScale;
      var descender = this.font.descender * fontScale;
      var x = options.x || 0;
      switch (anchor.horizontal) {
        case 'left':
          x -= 0;
          break;
        case 'center':
          x -= width / 2;
          break;
        case 'right':
          x -= width;
          break;
        default:
          throw new Error("Unknown anchor option: ".concat(anchor.horizontal));
      }
      var y = options.y || 0;
      switch (anchor.vertical) {
        case 'baseline':
          y -= ascender;
          break;
        case 'top':
          y -= 0;
          break;
        case 'middle':
          y -= height / 2;
          break;
        case 'bottom':
          y -= height;
          break;
        default:
          throw new Error("Unknown anchor option: ".concat(anchor.vertical));
      }
      var baseline = y + ascender;
      return {
        x: x,
        y: y,
        baseline: baseline,
        width: width,
        height: height,
        ascender: ascender,
        descender: descender
      };
    }
  }, {
    key: "getD",
    value: function getD(text) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var fontSize = options.fontSize || 72;
      var kerning = 'kerning' in options ? options.kerning : true;
      var letterSpacing = 'letterSpacing' in options ? options.letterSpacing : false;
      var tracking = 'tracking' in options ? options.tracking : false;
      var metrics = this.getMetrics(text, options);
      var path = this.font.getPath(text, metrics.x, metrics.baseline, fontSize, {
        kerning: kerning,
        letterSpacing: letterSpacing,
        tracking: tracking
      });
      return path.toPathData();
    }
  }, {
    key: "getPath",
    value: function getPath(text) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var attributes = Object.keys(options.attributes || {}).map(function (key) {
        return "".concat(key, "=\"").concat(options.attributes[key], "\"");
      }).join(' ');
      var d = this.getD(text, options);
      if (attributes) {
        return "<path ".concat(attributes, " d=\"").concat(d, "\"/>");
      }
      return "<path d=\"".concat(d, "\"/>");
    }
  }, {
    key: "getSVG",
    value: function getSVG(text) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var metrics = this.getMetrics(text, options);
      var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 \"".concat(metrics.width, "\" \"").concat(metrics.height, "\">");
      svg += this.getPath(text, options);
      svg += '</svg>';
      return svg;
    }
  }, {
    key: "getDebugSVG",
    value: function getDebugSVG(text) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options = JSON.parse(JSON.stringify(options));
      options.x = options.x || 0;
      options.y = options.y || 0;
      var metrics = this.getMetrics(text, options);
      var box = {
        width: Math.max(metrics.x + metrics.width, 0) - Math.min(metrics.x, 0),
        height: Math.max(metrics.y + metrics.height, 0) - Math.min(metrics.y, 0)
      };
      var origin = {
        x: box.width - Math.max(metrics.x + metrics.width, 0),
        y: box.height - Math.max(metrics.y + metrics.height, 0)
      };

      // Shift text based on origin
      options.x += origin.x;
      options.y += origin.y;
      var svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"".concat(box.width, "\" height=\"").concat(box.height, "\">");
      svg += "<path fill=\"none\" stroke=\"red\" stroke-width=\"1\" d=\"M0,".concat(origin.y, "L").concat(box.width, ",").concat(origin.y, "\"/>"); // X Axis
      svg += "<path fill=\"none\" stroke=\"red\" stroke-width=\"1\" d=\"M".concat(origin.x, ",0L").concat(origin.x, ",").concat(box.height, "\"/>"); // Y Axis
      svg += this.getPath(text, options);
      svg += '</svg>';
      return svg;
    }
  }], [{
    key: "loadSync",
    value: function loadSync() {
      var file = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_FONT;
      return new TextToSVG(opentype.loadSync(file));
    }
  }, {
    key: "load",
    value: function load(url, cb, opt) {
      opentype.load(url, function (err, font) {
        if (err !== null) {
          return cb(err, null);
        }
        return cb(null, new TextToSVG(font));
      }, opt);
    }
  }]);
  return TextToSVG;
}();
module.exports = exports["default"];