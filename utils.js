/*

Copyright (c) 2017 GALIRE

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Product for personal use and may not be resold or redistributed under any circumstances.

*/


/*

PARAMETERS:

width:   Image width in pixels. Default: original image width.
height:  Image height in pixels. Default: original image height.
format:  Image format (jpeg, png, bmp (Firefox only), webp (Chrome only)). Default: png.
quality: Image quality from 0.0 (lowest quality) to 1.0 (highest quality). Default: 1.0 (highest quality).
text1:   Text data 1.
...
textN:   Text data N.

*/

'use strict'

/*
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
 */
if (!String.prototype.startsWith) {
	String.prototype.startsWith = function(searchString, position){
	  position = position || 0;
	  return this.substr(position, searchString.length) === searchString;
  };
}

/*
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
 */
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
	  var subjectString = this.toString();
	  if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
		position = subjectString.length;
	  }
	  position -= searchString.length;
	  var lastIndex = subjectString.lastIndexOf(searchString, position);
	  return lastIndex !== -1 && lastIndex === position;
  };
}

var FF = isFirefoxBrowser();

var _defaultTexts;
var _imgs;
var _bgImg;
var _h, _w;
var _disableWidthHeightListeners = false;
var _map = {};
var _previewJsonStr;

//
function start(images, fonts, bgImageName, defaultTexts, title, makeContext) {
	document.title = title;

	_defaultTexts = defaultTexts;
	//
	var body = document.body;
	//
	var inputNumberWidth = document.getElementById('width');
	inputNumberWidth.oninput = function(event) {
		if (_disableWidthHeightListeners)
			return;
		_disableWidthHeightListeners = true;
		inputNumberHeight.value = Math.floor(inputNumberWidth.value * _h / _w);
		_disableWidthHeightListeners = false;
		saveUi();
		//
		if (inputNumberWidth.value != _w)
			btnSetOriginalSize.removeAttribute('disabled');
		else
			btnSetOriginalSize.setAttribute('disabled', '');
	};
	//
	var inputNumberHeight = document.getElementById('height');
	inputNumberHeight.oninput = function(event) {
		if (_disableWidthHeightListeners)
			return;
		_disableWidthHeightListeners = true;
		inputNumberWidth.value = Math.floor(inputNumberHeight.value * _w / _h);
		_disableWidthHeightListeners = false;
		saveUi();
		//
		if (inputNumberHeight.value != _h)
			btnSetOriginalSize.removeAttribute('disabled');
		else
			btnSetOriginalSize.setAttribute('disabled', '');
	};
	//
	var btnSetOriginalSize = document.getElementById('set_original_size');
	btnSetOriginalSize.onclick = function(event) {
		inputNumberWidth.value = _w;
		inputNumberHeight.value = _h;
		btnSetOriginalSize.setAttribute('disabled', '');
		saveUi();
	};
	//
	var selectFormat = document.getElementById('format');
	selectFormat.oninput = function(event) {
		saveUi();
	};
	//
	var table = document.getElementById('tbodyTop');
	var textsCount = _defaultTexts.length;
	for (var i = 0; i < textsCount; i++) {
		var tr = document.createElement('tr');
		tr.innerHTML = '<td class="label"><label for="text.' + i + '">Text ' + (i + 1) +'</label></td><td><input id="text.' + i + '" type="text" style="width:100%"></td>';
		table.appendChild(tr);
	}
	//
	var inputs = table.querySelectorAll("input[type='text']");
	for (var i = 0; i < inputs.length; i++)
		inputs[i].oninput = function(event) {
			saveUi();
			var json = ui2json();
			updateButtons(json.texts);
		};
	//
	//
	//
	//
	var div = document.createElement('div');
	div.style.position = 'absolute';
	div.style.right = 5;
	div.style.bottom = 5;
	body.appendChild(div);
	//
	var btnSetOriginal = document.getElementById('load_default_texts');
	btnSetOriginal.onclick = function (event) {
		var yes = confirm('Load sample data?');
		if (yes) {
			var defaultJson = getDefaultJson(_w, _h, _defaultTexts);
			texts2ui(defaultJson.texts);
			saveUi();
			var json = ui2json();
			updateButtons(json.texts);
		}
	};
	//
	var btnImage = document.getElementById('generate_image');
	btnImage.onclick = function(event) {
		updatePreview();
	};
	//
	var btnDownloadImage = document.getElementById('download_image');
	btnDownloadImage.onclick = function(event) {
		updatePreview();
		var json = ui2json();
		var json_str = JSON.stringify(json, null, 0);
		var url = _map[json_str];
		var ctx = makeContext(json);
		var a = document.getElementById('download_link');
		a.download = title + '.' + json.format;
		if (url === undefined) {
			createResizedUrl(ctx, json.width, json.height, json.format, json.quality, function(url) {
				_map[json_str] = url;
				a.href = url;
				a.click();
			});
		} else {
			a.href = url;
			a.click();
		}
	};
	//
	var preview = document.getElementById('preview');
	preview.onclick = function(event) {
		var json = ui2json();
		var json_str = JSON.stringify(json, null, 0);
		var url = _map[json_str];
		var wnd = window.open('', '_blank');
		wnd.document.write('<style>html, body {cursor:wait;}</style>');
		wnd.document.title = document.title + ' (Job in progress...)';
		//
		if (url === undefined) {
			var ctx = makeContext(json);
			createResizedUrl(ctx, json.width, json.height, json.format, json.quality, function(url) {
				_map[json_str] = url;
				wnd.location.href = url;
			});
		} else
			wnd.location.href = url;
	};
	//
	//
	//
	window.onresize = function(event) {
		var preview = document.getElementById('preview');
		preview.style.height = Math.floor(preview.offsetWidth * _h / _w);
	};
	//
	//
	//
	loadFontsAndImages(fonts, images, function(imgs) {
		_imgs = imgs;
		var firstKey = Object.getOwnPropertyNames(images)[0];
		_bgImg = document.images[bgImageName];
		_w = _bgImg.naturalWidth;
		_h = _bgImg.naturalHeight;
		//
		_disableWidthHeightListeners = true;
		inputNumberWidth.value = _w;
		inputNumberHeight.value = _h;
		_disableWidthHeightListeners = false;
		//
		btnSetOriginalSize.innerHTML = '← Set original (' + _w + ' ✕ ' + _h + ')';
		//
		updatePreview();

		var json = ui2json();
		updateButtons(json.texts);

	});
}

function updatePreview() {
		var json = restoreUi(_w, _h, _defaultTexts);
		//
		json.width = _w;
		json.height = _h;
		json.format = 'png';
		//
		var ctx = makeContext(json);
		//
		var json_str = JSON.stringify(json, null, 0);
		var url = _map[json_str];
		if (url == undefined)
			createResizedUrl(ctx, json.width, json.height, json.format, json.quality, function(url) {
				_map[json_str] = url;
				var preview = document.getElementById('preview');
				//
				preview.style.backgroundImage = "url('" + url + "')";
				document.getElementById('table').style.visibility = 'visible';
				preview.style.height = Math.floor(preview.offsetWidth * _h / _w);
				//
				var json = ui2json();
				_previewJsonStr = JSON.stringify(json.texts, null, 0);
				updateButtons(json.texts);
			});
		else {
			var preview = document.getElementById('preview');
			//
			preview.style.backgroundImage = "url('" + url + "')";
			document.getElementById('table').style.visibility = 'visible';
			preview.style.height = Math.floor(preview.offsetWidth * _h / _w);
			//
			var json = ui2json();
			_previewJsonStr = JSON.stringify(json.texts, null, 0);
			updateButtons(json.texts);
		}
}

function saveUi() {
	var json = ui2json();
	var jsonStr = JSON.stringify(json, null, 0);
	if (localStorage.json != jsonStr)
		localStorage.json = jsonStr;
}

function restoreUi(w, h, defaultTexts) {
	var jsonStr = localStorage.json;
	var json;
	if (jsonStr === undefined)
		json = getDefaultJson(w, h, defaultTexts);
	else
		json = JSON.parse(jsonStr);
	//
	json2ui(json);
	//
	return json;
}

function json2ui(json) {
	_disableWidthHeightListeners = true;
	var inputNumberWidth = document.getElementById('width');
	inputNumberWidth.value = json.width;
	var inputNumberHeight = document.getElementById('height');
	inputNumberHeight.value = json.height;
	_disableWidthHeightListeners = false;
	//
	var selectFormat = document.getElementById('format');
	selectFormat.value = json.format;
	//
	var btnSetOriginalSize = document.getElementById('set_original_size');
	if (json.width == _w || json.height == _h)
		btnSetOriginalSize.setAttribute('disabled', '');
	else
		btnSetOriginalSize.removeAttribute('disabled');
	//
	texts2ui(json.texts);
}

function updateButtons(texts) {
	var btnImage = document.getElementById('generate_image');
	if (_previewJsonStr == JSON.stringify(texts, null, 0))
		btnImage.setAttribute('disabled', '');
	else
		btnImage.removeAttribute('disabled');
	//
	var btnSetOriginal = document.getElementById('load_default_texts');
	if (JSON.stringify(_defaultTexts, null, 0) == JSON.stringify(texts, null, 0))
		btnSetOriginal.setAttribute('disabled', '');
	else
		btnSetOriginal.removeAttribute('disabled');
}

function texts2ui(texts) {
	var table = document.getElementById('tbodyTop');
	var inputs = table.querySelectorAll("input[type='text']");
	var arr = [];
	for (var i = 0; i < inputs.length; i++)
		inputs[i].value = texts[i];
}

function ui2json() {
	var inputNumberWidth = document.getElementById('width');
	var inputNumberHeight = document.getElementById('height');
	var selectFormat = document.getElementById('format');
	var table = document.getElementById('tbodyTop');
	var json = {
		width: parseInt(inputNumberWidth.value),
		height: parseInt(inputNumberHeight.value),
		format: selectFormat.value,
		quality: 1
	};
	var inputs = table.querySelectorAll("input[type='text']");
	var arr = [];
	for (var i = 0; i < inputs.length; i++)
		arr.push(inputs[i].value.trim());
	json['texts'] = arr;
	return json;
}

function getDefaultJson(w, h, texts) {
	return {
		width: w,
		height: h,
		format: "png",
		quality: 1,
		texts: texts
	};
}

function createResizedUrl(ctx, width, height, format, quality, callback) {
	if (ctx.canvas.width == width || ctx.canvas.height == height) {
		var url = createUrl(ctx, format, quality);
		callback(url);
	} else {
		var ctx0 = createContext(width, height);
		canvasResize(ctx.canvas, ctx0.canvas, function() {
			var url = createUrl(ctx0, format, quality);
			callback(url);
		});
	}
}

function parseParamsString(s) {
	var o = {};
	//
	var lines = s.split('\n');
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		var pos = line.indexOf(':');
		if (pos == -1)
			continue;
		var key = line.substring(0, pos).trim();
		var value = line.substring(pos + 1).trim();
		if (key == 'width' || key == 'height') {
			if (isNaN(value) || value == '')
				continue;
			value = parseInt(value);
			if (value <= 0)
				continue;
		} else if (key == 'quality') {
			value = parseFloat(value);
			if (isNaN(value))
				value = 1.0;
			value = parseFloat(value);
			if (value < 0.0)
				value = 0.0;
			if (value > 1.0)
				value = 1.0;
		} else if (key == 'format') {
			value = value.toLowerCase();
			if (value != 'png' && value != 'jpeg' && value != 'bmp' && value != 'webp')
				value = 'png';
		}
		o[key] = value;
	}
	//
	return o;
}

function format2mime(format) {
	if (format == 'png') // Chrome, Firefox
		return'image/png';
	else if (format == 'jpeg') // Chrome, Firefox
		return'image/jpeg';
	else if (format == 'bmp') // Firefox
		return'image/bmp';
	else if (format == 'webp') // Chrome
		return'image/webp';
	else // Chrome, Firefox
		return'image/png';
}

function createUrl(ctx, format, quality) {
	var canvas = ctx.canvas;
	//
	var w = parseInt(canvas.getAttribute('width'));
	var h = parseInt(canvas.getAttribute('height'));
	//
	var contentType;
	if (format === undefined)
		format = 'png'
	else
		format = format.toLowerCase();
	//
	contentType = format2mime(format);
	//
	var dataURL = canvas.toDataURL(contentType, quality);
	//
	var pos1 = 5;
	var pos2 = dataURL.indexOf(';base64,');
	var realContentType = dataURL.substring(pos1, pos2);
	var b64Data = dataURL.split(',')[1];
	var blob = b64toBlob(b64Data, realContentType);
	return URL.createObjectURL(blob);
}

function b64toBlob(b64Data, contentType) {
	var sliceSize = 512;

	var byteCharacters = atob(b64Data);
	var byteArrays = [];

	for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
		var slice = byteCharacters.slice(offset, offset + sliceSize);
		var byteNumbers = new Array(slice.length);
		for (var i = 0; i < slice.length; i++)
			byteNumbers[i] = slice.charCodeAt(i);
		var byteArray = new Uint8Array(byteNumbers);
		byteArrays.push(byteArray);
	}

	return new Blob(byteArrays, {type: contentType});
}

function isFirefoxBrowser() {
	return typeof InstallTrigger !== 'undefined'; // Firefox 1.0+
}

function deg2rad(deg) {
	return - deg * Math.PI / 180;
}

function createContext(width, height) {
	var c = document.createElement('canvas');
	c.setAttribute('width', width);
	c.setAttribute('height', height);
	//
	return c.getContext("2d");
}

function measureTextHeight(ctx, text) {
	var d = document.createElement("span");
	d.style.font = ctx.font;
	d.style.marginTop = 0;
	d.style.paddingTop = 0;
	d.textContent = text;
	document.body.appendChild(d);
	var height = d.offsetHeight;
	d.parentElement.removeChild(d);
	return height;
}

function getRightX(ctx, text, kerning) {
	var cw = ctx.canvas.width;
	var	tw = ctx.measureText(text).width + text.length * kerning;
	return cw - tw;
}

function getCenterX(ctx, text, kerning) {
	return getRightX(ctx, text, kerning) / 2;
}

function drawText(ctx, text, kerning, stroke, fill) {
	var x = 0;
	var wAll = ctx.measureText(text).width;
	while (text != "") {
		var chr = text.substr(0, 1);
		text = text.substr(1);
		if (stroke)
			ctx.strokeText(chr, x, 0);
		if (fill)
			ctx.fillText(chr, x, 0);
		var wShorter = ctx.measureText(text).width;
		var wChar = wAll - wShorter;
		x += wChar + kerning;
		wAll = wShorter;
	}
}

/* --------------------- LOAD FONTS AND IMAGES --------------------- */

function loadFontsAndImages(fonts, images, callback) {
	loadFonts(fonts, function(event) {
		loadImages(images, function(imgs) {
			callback(imgs);
		});
	});
}

function loadImages(images, callback ) {
	var keys = Object.keys(images);
	var loaded = 0;
	var imgs = {};
	var inc = function() {
		loaded++;
		if ( loaded === keys.length && callback )
			callback( imgs );
	};
	//
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		var src = images[key];
		var img = new Image();
		imgs[key] = img;
		img.name = key;
		img.onload = inc;
		img.src = src;
		img.hidden = true;
		document.body.appendChild(img);
	}
}

function loadFonts(fonts, callback) {
	var fontFamilies = Object.getOwnPropertyNames(fonts);
	if (fontFamilies.length == 0) {
		callback();
		return;
	}
	//
	var callbackCalled;
	if (document.fonts != null && document.fonts != undefined) {
		document.fonts.onloadingdone = callback;
		callbackCalled = true;
	} else
		callbackCalled = false;
	//
	var style = document.createElement('style');
	for (var key in fonts) {
		if (!fonts.hasOwnProperty(key))
			continue;
		var url = fonts[key];
		var el = document.createElement('p');
		el.style.visibility = 'hidden';
		el.style.position = 'absolute';
		el.style.font = "1px '" + key + "'";
		el.textContent = 'a';
		document.body.appendChild(el);
		//
		var ff = el.style.fontFamily;
		//
		if (ff.startsWith('"') || ff.startsWith("'"))
			ff = ff.substring(1, ff.length - 1);
		if (url === undefined) {
			console.log("Unknown Font Family: '" + ff + "'");
			continue;
		}
		var format;
		if (url.endsWith('.ttf'))
			format = 'truetype';
		else if (url.endsWith('.woff'))
			format = 'woff';
		else if (url.endsWith('.woff2'))
			format = 'woff2';
		else if (url.endsWith('.otf'))
			format = 'opentype';
		//
		var css = "@font-face {font-family: '" + ff + "'; src: url('" +  url + "'); format('" + format + "');}";
		style.textContent += css;
	}
	var head = document.querySelector('head');
	head.appendChild(style);
	if (!callbackCalled)
		callback();
}

/* ----------------------------------------------------------------- */
/*                             THIRD PARTY                           */
/* ----------------------------------------------------------------- */

/*
 * MIT License
 *  You may use this code as long as you retain this notice.  Use at your own risk! :)
 *  https://github.com/danschumann/limby-resize
 *  0.0.8
 */
function canvasResize(original, canvas, callback) {
	var
	  w1 = original.width,
	  h1 = original.height,
	  w2 = canvas.width,
	  h2 = canvas.height,
	  img = original.getContext("2d").getImageData(0, 0, w1, h1),
	  img2 = canvas.getContext("2d").getImageData(0, 0, w2, h2);

	if (w2 > w1 || h2 > h1) {
	  canvas.getContext('2d').drawImage(original, 0, 0, w2, h2);
	  return callback();
	};


	var data = img.data;
	// it's an _ because we don't use it much, as working with doubles isn't great
	var _data2 = img2.data;
	// Instead, we enforce float type for every entity in the array
	// this prevents weird faded lines when things get rounded off
	var data2 = Array(_data2.length);
	for (var i = 0; i < _data2.length; i++){
	  data2[i] = 0.0;
	}

	// We track alphas, since we need to use alphas to correct colors later on
	var alphas = Array(_data2.length >> 2);
	for (var i = 0; i < _data2.length >> 2; i++){
	  alphas[i] = 1;
	}

	// this will always be between 0 and 1
	var xScale = w2 / w1;
	var yScale = h2 / h1;

	var deferred;

	// We process 1 row at a time ( and then let the process rest for 0ms [async] )
	var nextY = function(y1){
	  for (var x1 = 0; x1 < w1; x1++) {

		var

		// the original pixel is split between two pixels in the output, we do an extra step
		extraX = false,
		extraY = false,

		// the output pixel
		targetX = Math.floor(x1 * xScale),
		targetY = Math.floor(y1 * yScale),

		// The percentage of this pixel going to the output pixel (this gets modified)
		xFactor = xScale,
		yFactor = yScale,

		// The percentage of this pixel going to the right neighbor or bottom neighbor
		bottomFactor = 0,
		rightFactor = 0,

		// positions of pixels in the array
		offset = (y1 * w1 + x1) * 4,
		targetOffset = (targetY * w2 + targetX) * 4;

		// Right side goes into another pixel
		if (targetX < Math.floor((x1 + 1) * xScale)) {

		rightFactor = (((x1 + 1) * xScale) % 1);
		xFactor -= rightFactor;

		extraX = true;

		}

		// Bottom side goes into another pixel
		if (targetY < Math.floor((y1 + 1) * yScale)) {

		bottomFactor = (((y1 + 1) * yScale) % 1);
		yFactor -= bottomFactor;

		extraY = true;

		}

		var a;

		a = (data[offset + 3] / 255);

		var alphaOffset = targetOffset / 4;

		if (extraX) {

		// Since we're not adding the color of invisible pixels,  we multiply by a
		data2[targetOffset + 4] += data[offset] * rightFactor * yFactor * a;
		data2[targetOffset + 5] += data[offset + 1] * rightFactor * yFactor * a;
		data2[targetOffset + 6] += data[offset + 2] * rightFactor * yFactor * a;

		data2[targetOffset + 7] += data[offset + 3] * rightFactor * yFactor;

		// if we left out the color of invisible pixels(fully or partly)
		// the entire average we end up with will no longer be out of 255
		// so we subtract the percentage from the alpha ( originally 1 )
		// so that we can reverse this effect by dividing by the amount.
		// ( if one pixel is black and invisible, and the other is white and visible,
		// the white pixel will weight itself at 50% because it does not know the other pixel is invisible
		// so the total(color) for the new pixel would be 128(gray), but it should be all white.
		// the alpha will be the correct 128, combinging alphas, but we need to preserve the color
		// of the visible pixels )
		alphas[alphaOffset + 1] -= (1 - a) * rightFactor * yFactor;
		}

		if (extraY) {
		data2[targetOffset + w2 * 4]     += data[offset] * xFactor * bottomFactor * a;
		data2[targetOffset + w2 * 4 + 1] += data[offset + 1] * xFactor * bottomFactor * a;
		data2[targetOffset + w2 * 4 + 2] += data[offset + 2] * xFactor * bottomFactor * a;

		data2[targetOffset + w2 * 4 + 3] += data[offset + 3] * xFactor * bottomFactor;

		alphas[alphaOffset + w2] -= (1 - a) * xFactor * bottomFactor;
		}

		if (extraX && extraY) {
		data2[targetOffset + w2 * 4 + 4]     += data[offset] * rightFactor * bottomFactor * a;
		data2[targetOffset + w2 * 4 + 5] += data[offset + 1] * rightFactor * bottomFactor * a;
		data2[targetOffset + w2 * 4 + 6] += data[offset + 2] * rightFactor * bottomFactor * a;

		data2[targetOffset + w2 * 4 + 7] += data[offset + 3] * rightFactor * bottomFactor;

		alphas[alphaOffset + w2 + 1] -= (1 - a) * rightFactor * bottomFactor;
		}

		data2[targetOffset]     += data[offset] * xFactor * yFactor * a;
		data2[targetOffset + 1] += data[offset + 1] * xFactor * yFactor * a;
		data2[targetOffset + 2] += data[offset + 2] * xFactor * yFactor * a;

		data2[targetOffset + 3] += data[offset + 3] * xFactor * yFactor;

		alphas[alphaOffset] -= (1 - a) * xFactor * yFactor;
	  };

	  if (y1++ < h1) {
		// Big images shouldn't block for a long time.
		// This breaks up the process and allows other processes to tick
		setTimeout(function(){
		nextY(y1)
		}, 0);
	  } else
		done();

	};

	var done = function(){

	  // fully distribute the color of pixels that are partially full because their neighbor is transparent
	  // (i.e. undo the invisible pixels are averaged with visible ones)
	  for (var i = 0; i < (_data2.length >> 2); i++){
		if (alphas[i] && alphas[i] < 1) {
		data2[(i<<2)] /= alphas[i];     // r
		data2[(i<<2) + 1] /= alphas[i]; // g
		data2[(i<<2) + 2] /= alphas[i]; // b
		}
	  }

	  // re populate the actual imgData
	  for (var i = 0; i < data2.length; i++){
		_data2[i] = Math.round(data2[i]);
	  }

	  var context = canvas.getContext("2d")
	  context.putImageData(img2, 0, 0);
	  callback();

	};

	// Start processing the image at row 0
	nextY(0);
}

/*
 * http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
 */
function shadeBlend(p,c0,c1) {
	var n=p<0?p*-1:p,u=Math.round,w=parseInt;
	if(c0.length>7){
		var f=c0.split(","),t=(c1?c1:p<0?"rgb(0,0,0)":"rgb(255,255,255)").split(","),R=w(f[0].slice(4)),G=w(f[1]),B=w(f[2]);
		return "rgb("+(u((w(t[0].slice(4))-R)*n)+R)+","+(u((w(t[1])-G)*n)+G)+","+(u((w(t[2])-B)*n)+B)+")"
	}else{
		var f=w(c0.slice(1),16),t=w((c1?c1:p<0?"#000000":"#FFFFFF").slice(1),16),R1=f>>16,G1=f>>8&0x00FF,B1=f&0x0000FF;
		return "#"+(0x1000000+(u(((t>>16)-R1)*n)+R1)*0x10000+(u(((t>>8&0x00FF)-G1)*n)+G1)*0x100+(u(((t&0x0000FF)-B1)*n)+B1)).toString(16).slice(1)
	}
}

