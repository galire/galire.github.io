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

var FF = isFirefoxBrowser();

var _storage;
var _defaultTexts;
var _imgs;
var _bgImg;
var _h, _w;
var _disableWidthHeightListeners = false;
var _map = {};
var _previewJsonStr;

//
function start(images, fonts, bgImageName, defaultTexts, title, makeContext) {
	if (window['localStorage'] === undefined || window['localStorage'] === null)
		var localStorage = {};
	if (window['sessionStorage'] === undefined || window['sessionStorage'] === null)
		var sessionStorage = {};
	//
	var body = document.body;
	//
	document.title = title;

	_defaultTexts = defaultTexts;
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
		tr.innerHTML = '<td class="label"><label for="text.' + i + '">Text ' + (i + 1) +'</label></td><td style="width: calc(100% - 70px)"><input id="text.' + i + '" type="text" style="width:100%"></td>';
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
	var saveSettingsCheckbox = document.getElementById('saveSettingsCheckbox');
	saveSettingsCheckbox.onchange = function(event) {
		var checkbox = event.target;
		var save = checkbox.checked;
		if (save) {
			_storage = localStorage;
			localStorage.save = 'true';
		} else {
			_storage = sessionStorage;
			localStorage.save = 'false';
		}
		saveUi();
	};
	//
	//
	//
	window.onresize = function(event) {
		var preview = document.getElementById('preview');
		preview.style.height = Math.floor(preview.offsetWidth * _h / _w) + 'px';
	};
	//
	//
	fonts["Roboto"] = /*{*/"Roboto-Regular.ttf"/*}*/;
	//
	loadFontsAndImages(fonts, images, function(imgs) {
		var save;
		if (localStorage.save === undefined)
			save = true;
		else
			save = localStorage.save == 'true' ? true : false;
		//
		_storage = save ? localStorage : sessionStorage;
		//
		saveSettingsCheckbox.checked = save;
		//
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
				preview.style.height = Math.floor(preview.offsetWidth * _h / _w) + 'px';
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
			preview.style.height = Math.floor(preview.offsetWidth * _h / _w) + 'px';
			//
			var json = ui2json();
			_previewJsonStr = JSON.stringify(json.texts, null, 0);
			updateButtons(json.texts);
		}
}

function saveUi() {
	var json = ui2json();
	var jsonStr = JSON.stringify(json, null, 0);
	_storage.json = jsonStr;
}

function restoreUi(w, h, defaultTexts) {
	var jsonStr = _storage.json;
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

