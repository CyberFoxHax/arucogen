function generateMarkerSvg(width, height, bits) {
	var svg = $('<svg/>').attr({
		viewBox: '0 0 ' + (width + 2) + ' ' + (height + 2),
		xmlns: 'http://www.w3.org/2000/svg',
		'shape-rendering': 'crispEdges' // disable anti-aliasing to avoid little gaps between rects
	});

	// Background rect
	$('<rect/>').attr({
		x: 0,
		y: 0,
		width: width + 2,
		height: height + 2,
		fill: 'black'
	}).appendTo(svg);

	// "Pixels"
	for (var i = 0; i < height; i++) {
		for (var j = 0; j < width; j++) {
			var color = bits[i * height + j] ? 'white' : 'black';
			var pixel = $('<rect/>').attr({
				width: 1,
				height: 1,
				x: j + 1,
				y: i + 1,
				fill: color
			});
			pixel.appendTo(svg);
		}
	}

	return svg;
}

function generateMarkerCanvas(width, height, bits, size) {
	var canvas = document.createElement("canvas");
	canvas.width = (width+2) * size;
	canvas.height = (height+2) * size;
	var ctx = canvas.getContext("2d");
	
	
	ctx.fillStyle = "black";
	ctx.fillRect(
		0,
		0,
		(width + 2) * size,
		(height + 2) * size
	);
	
	var fillRect = function(x, y, width2, height2){
		ctx.fillRect(
			x * size,
			y * size,
			width2 * size,
			height2 * size
		);
	}

	// "Pixels"
	for (var i = 0; i < height; i++) {
		for (var j = 0; j < width; j++) {
			ctx.fillStyle = bits[i * height + j] == 1 ? 'white' : 'black';
			fillRect(
				j+1,
				i+1,
				1,
				1
			);
		}
	}
	
	return canvas;
}

function generateArucoMarker(width, height, dictName, id, size, format) {
	console.log('Generate ArUco marker ' + dictName + ' ' + id);

	var bytes = dict[dictName][id];
	var bits = [];
	var bitsCount = width *  height;

	// Parse marker's bytes
	for (var byte of bytes) {
		var start = bitsCount - bits.length;
		for (var i = Math.min(7, start - 1); i >= 0; i--) {
			bits.push((byte >> i) & 1);
		}
	}
	
	if(format == "Svg")
		return generateMarkerSvg(width, height, bits);
	else if(format == "Canvas")
		return generateMarkerCanvas(width, height, bits, size);
	else
		throw "Unknown format value: " + format;
}

$(function() {
	var dictSelect = $('.setup select[name=dict]');
	var markerIdInput = $('.setup input[name=id]');
	var sizeInput = $('.setup input[name=size]');
	var outputFormatSelect = $('.setup select[name=output_format]');

	function updateMarker() {
		
		var markerId = Number(markerIdInput.val());
		var size = Number(sizeInput.val());
		var dictName = dictSelect.val();
		var outputFormat = outputFormatSelect.val();
		var width = Number(dictSelect.find('option:selected').attr('data-width'));
		var height = Number(dictSelect.find('option:selected').attr('data-height'));

		// Generate marker
		var element = generateArucoMarker(width, height, dictName, markerId, size, outputFormat);
		if(outputFormat == "Svg"){
			var svg = element;
			svg.attr({
				width: size + 'mm',
				height: size + 'mm'
			});
			$('.marker').html(svg[0].outerHTML);
			$('.save-button').attr({
				href: 'data:image/svg;base64,' + btoa(svg[0].outerHTML.replace('viewbox', 'viewBox')),
				download: dictName + '-' + markerId + '.svg'
			});
		}
		else if(outputFormat == "Canvas"){
			//$(element).attr({
			//	width: size + 'mm',
			//	height: size + 'mm'
			//});
			$('.marker').html(element);
		}
		$('.marker-id').html('ID ' + markerId);
	}

	updateMarker();

	dictSelect.change(updateMarker);
	outputFormatSelect.change(updateMarker);
	$('.setup input').on('input', updateMarker);
	var script = document.createElement("script");
	script.type = "text/javascript";
	document.head.appendChild(script);
});
