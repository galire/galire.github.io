'use strict'

function makeContext(o) {
	var bgImg = document.images[bgImageName];
	var w = bgImg.naturalWidth;
	var h = bgImg.naturalHeight;

	var ctx = createContext(w, h);
	//
	//
	ctx.drawImage(bgImg, 0, 0);
	//
	ctx.save();
	//
	ctx.strokeStyle = gcolor;
	ctx.lineWidth = 1 * w/100,
	ctx.strokeRect(1.5 * w/100, 1.5 * w/100, w - 3 * w/100, h - 3 * w/100);
	//
	ctx.lineWidth = 0.2 * w/100,
	ctx.strokeRect(2.4 * w/100, 2.4 * w/100, w - 4.8 * w/100, h - 4.8 * w/100);
	ctx.restore();
	//
	var rightMargin = 8 * w / 100;
	//
	//
	ctx.save();
	var text = o.texts[0];
	var font = 10.1 * w/100 + "px 'Starjedi'";
	var kerning = 0.5 * w/100;
	//
	//
	ctx.fillStyle = gcolor;
	ctx.strokeStyle = "#D28960",
	//
	ctx.font = font;
	ctx.textBaseline = 'top';
	ctx.lineWidth = 0.5 * w/100,
	ctx.shadowColor = "#000";
	ctx.shadowOffsetX = 0.2 * w/100;
	ctx.shadowOffsetY = 0.2 * w/100;
	ctx.shadowBlur = 0.2 * w/100;
	//
	var topMargin = (FF ? 6 : -1.0) * h/100;
	var leftMargin = getCenterX(ctx, text, kerning);
	ctx.translate(leftMargin, topMargin);
	drawText(ctx, text, kerning, true, true);
	ctx.restore();
	//
	//
	//
	ctx.save();
	var text = (o.texts[5] == '') ? '' : '[' + o.texts[5] + ']';
	var font = 6 * w/100 + "px 'stamper'";
	var kerning = 0;
	//
	ctx.fillStyle = '#444';
	//
	ctx.font = font;
	ctx.textBaseline = 'top';
	var rightX = getRightX(ctx, text, kerning);
	var bottomMargin = 6.3 * h/100;
	var leftMargin = rightX - rightMargin;
	ctx.translate(leftMargin, h - bottomMargin);
	ctx.rotate(deg2rad(7));
	drawText(ctx, text, kerning, false, true);
	ctx.restore();
	//
	//
	//
	ctx.save();
	var text = o.texts[1];
	var font = 6.5 * w/100 + "px 'SCRIPTIN'";
	var kerning = 1 * w/100;
	//
	ctx.fillStyle = '#D28960';
	ctx.strokeStyle = "#D28960",
	//
	ctx.font = font;
	ctx.textBaseline = 'top';
	ctx.shadowColor = "#000";
	ctx.shadowOffsetX = 0.02 * w/100;
	ctx.shadowOffsetY = 0.02 * w/100;
	ctx.shadowBlur = 0.2 * w/100;
	//
	var rightX = getRightX(ctx, text, kerning);
	var topMargin = (FF ? 25 : 12.3) * h/100;
	var leftMargin = rightX - rightMargin;
	ctx.translate(leftMargin, topMargin);
	drawText(ctx, text, kerning, true, true);
	ctx.restore();
	//
	//
	//
	ctx.save();
	var font = 2.0 * w/100 + "px 'MODES'";
	var kerning = 0;
	ctx.fillStyle = '#555';
	//
	//
	ctx.font = font;
	ctx.textBaseline = 'top';
	//
	var text = o.texts[2];
	var rightX = getRightX(ctx, text, kerning);
	var topMargin = 38.2 * h/100;
	var leftMargin = rightX - rightMargin;
	ctx.translate(leftMargin, topMargin);
	drawText(ctx, text, kerning, false, true);
	ctx.restore();
	//
	//
	//
	ctx.save();
	var font = 2.0 * w/100 + "px 'MODES'";
	var kerning = 0;
	ctx.fillStyle = '#555';
	//
	//
	ctx.font = font;
	ctx.textBaseline = 'top';
	//
	var text = o.texts[3];
	var rightX = getRightX(ctx, text, kerning);
	var topMargin = 41.2 * h/100;
	var leftMargin = rightX - rightMargin;
	ctx.translate(leftMargin, topMargin);
	drawText(ctx, text, kerning, false, true);
	ctx.restore();
	//
	//
	//
	ctx.save();
	var font = 2.0 * w/100 + "px 'MODES'";
	var kerning = 0;
	ctx.fillStyle = '#555';
	//
	ctx.font = font;
	ctx.textBaseline = 'top';
	//
	var text = o.texts[4];
	var topMargin = 45 * h/100;
	var rightX = getRightX(ctx, text, kerning);
	var leftMargin = rightX - rightMargin;
	ctx.translate(leftMargin, topMargin);
	drawText(ctx, text, kerning, false, true);
	ctx.restore();
	//
	return ctx;
}

var fonts = {
	"MODES":    /*{*/"fonts/MODES___.TTF"/*}*/,
	"stamper":  /*{*/"fonts/old_stamper.ttf"/*}*/,
	"Starjedi": /*{*/"fonts/Starjedi.ttf"/*}*/,
	"SCRIPTIN": /*{*/"fonts/SCRIPTIN.ttf"/*}*/,
};

var images = {
/*!*/	"image01": /*{*/"images/MaxPixel.freegreatpicture.com-Egg-Hatch-Lego-Batman-Hatched-Begin-Beginning-1367730.jpg"/*}*/,
//~01~	"image01": /*{*/"images/MaxPixel.freegreatpicture.com-Egg-Hatch-Lego-Batman-Hatched-Begin-Beginning-1367730.jpg"/*}*/,
//~02~	"image02": /*{*/"images/MaxPixel.freegreatpicture.com-Hatch-Egg-Lego-Begin-Hatched-Superman-Beginning-1367737.jpg"/*}*/,
//~03~	"image03": /*{*/"images/MaxPixel.freegreatpicture.com-Lego-Hatched-Stormtrooper-Hatch-Begin-Egg-1367777.jpg"/*}*/,
//~04~	"image04": /*{*/"images/MaxPixel.freegreatpicture.com-Storm-Trooper-Egg-Lego-Stormtrooper-Balance-1351022M.jpg"/*}*/,
};

//~M~var gcolor = '#4192BD'; // M
//~F~var gcolor = '#FD4B9D'; // F
//~N~var gcolor = '#FFFFFF'; // N
/*!*/var gcolor = '#4192BD'; // M
//
//
//
var title = 'Baby Shower Invitation';

var sampleTexts = [];
sampleTexts.push('Baby Shower');
sampleTexts.push('Amelia Smythe');
sampleTexts.push('123 Main Street');
sampleTexts.push('Anytown, CA');
sampleTexts.push('RSVP by April 15. Phone: 563-162-4591');
sampleTexts.push('Sat Apr 25 2:00 PM');
//
var bgImageName = "image01";
