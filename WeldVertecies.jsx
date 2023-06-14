#target illustrator
/*
PathPoint.leftDirection - The position of this path point’s in control point.
PathPoint.rightDirection - The position of this path point’s out control point.

*/

function contains(arr, obj) {
	var i = arr.length;
	while (i--) {
		if (arr[i] === obj) {
			return true;
		}
	}
	return false;
}

function colorFromRGB(r, g, b) {
	var result = new RGBColor();
	result.red = r;
	result.green = g;
	result.blue = b;
	return result;
}

function copyArray(arr) {

	var numbersCopy = [];
	var i = -1;

	while (++i < arr.length) {
		numbersCopy[i] = arr[i];
	}
	return numbersCopy;
}


function reverseShape(shape) {
	var activeLay = app.activeDocument.activeLayer;
	var testCircDiaS = .5;
	var testCircDiaE = 2.0;
	var dupShape = shape.duplicate();
	//activeLay.pathItems.ellipse((shape.pathPoints[0].anchor[1] - testCircDiaS/2.0),(shape.pathPoints[0].anchor[0] - testCircDiaS/2.0), testCircDiaS, testCircDiaS);
	//activeLay.pathItems.ellipse((shape.pathPoints[1].anchor[1] - testCircDiaE/2.0),(shape.pathPoints[1].anchor[0] - testCircDiaE/2.0), testCircDiaE, testCircDiaE);
	var shapePoint = copyArray(shape.pathPoints);
	for (var k = 0; k < shape.pathPoints.length; k++) {

		var p2i = shape.pathPoints[k];
		//$.writeln(p2i.anchor);
		var revPoint = dupShape.pathPoints[shapePoint.length - 1 - k]
		//$.writeln(revPoint.anchor);
		p2i.anchor = revPoint.anchor;
		p2i.rightDirection = revPoint.leftDirection;
		p2i.leftDirection = revPoint.rightDirection;
		p2i.pointType = revPoint.pointType;
		p2i.handle = revPoint.handle;
	}

	dupShape.remove()
	//activeLay.pathItems.ellipse((shape.pathPoints[0].anchor[1] - testCircDiaS/2.0),(shape.pathPoints[0].anchor[0] - testCircDiaS/2.0), testCircDiaS, testCircDiaS);
	//activeLay.pathItems.ellipse((shape.pathPoints[1].anchor[1] - testCircDiaE/2.0),(shape.pathPoints[1].anchor[0] - testCircDiaE/2.0), testCircDiaE, testCircDiaE);
}

function joinSelectedLinesByClosestPoints(weldThreshold) {
	var doc = app.activeDocument;
	var selectedLines = doc.selection;
	var lineCount = selectedLines.length;
	var linesToRemove = [];
	var testCircDia = 1.0;
	var activeLay = app.activeDocument.activeLayer;

	doc.selection = null;


	for (var i = 0; i < lineCount; i++) {
		var line1 = selectedLines[i];
		if (line1.typename !== 'PathItem') continue;
		if (contains(linesToRemove, line1)) continue;

		var startPoint1 = line1.pathPoints[0];
		var endPoint1 = line1.pathPoints[line1.pathPoints.length - 1];
		//$.writeln(startPoint1.anchor[1])
		//$.writeln(endPoint1.anchor[1])
		// activeLay.pathItems.ellipse((startPoint1[1] + testCircDia/2.0),(startPoint1[0] - testCircDia/2.0), testCircDia, testCircDia);
		// activeLay.pathItems.ellipse((endPoint1[1] + testCircDia/2.0),(endPoint1[0] - testCircDia/2.0), testCircDia, testCircDia);
		var closestLineIndex = -1;
		var closestDistance = Infinity;

		for (var j = 0; j < lineCount; j++) {
			if (i === j) continue;

			var line2 = selectedLines[j];

			if (contains(linesToRemove, line2)) continue;

			if (line2.typename !== 'PathItem') continue;

			var startPoint2 = line2.pathPoints[0];
			var endPoint2 = line2.pathPoints[line2.pathPoints.length - 1];
			//$.writeln(startPoint2)
			// $.writeln(endPoint2)
			//activeLay.pathItems.ellipse((startPoint2.anchor[1] - testCircDia/2.0),(startPoint2.anchor[0] - testCircDia/2.0), testCircDia, testCircDia);
			//activeLay.pathItems.ellipse((endPoint2[0] - testCircDia/2.0),(endPoint2[1] - testCircDia/2.0), testCircDia, testCircDia);

			var distanceStartStart = Math.sqrt(Math.pow(startPoint1.anchor[0] - startPoint2.anchor[0], 2) + Math.pow(startPoint1.anchor[1] - startPoint2.anchor[1], 2));
			var distanceStartEnd = Math.sqrt(Math.pow(startPoint1.anchor[0] - endPoint2.anchor[0], 2) + Math.pow(startPoint1.anchor[1] - endPoint2.anchor[1], 2));
			var distanceEndStart = Math.sqrt(Math.pow(endPoint1.anchor[0] - startPoint2.anchor[0], 2) + Math.pow(endPoint1.anchor[1] - startPoint2.anchor[1], 2));
			var distanceEndEnd = Math.sqrt(Math.pow(endPoint1.anchor[0] - endPoint2.anchor[0], 2) + Math.pow(endPoint1.anchor[1] - endPoint2.anchor[1], 2));

			var minDistance = Math.min(distanceStartStart, distanceStartEnd, distanceEndStart, distanceEndEnd);

			if (distanceStartEnd < weldThreshold) {
				//$.writeln("start of first is end of second");
				// prepend the points of line 2 to line 1
				//activeLay.pathItems.ellipse((startPoint1.anchor[1] - testCircDia/2.0),(startPoint1.anchor[0] - testCircDia/2.0), testCircDia, testCircDia);
				endPoint2.pointType = PointType.CORNER
				startPoint1.pointType = PointType.CORNER
				endPoint2.rightDirection = startPoint1.rightDirection // end 1 out = start 2 out
				startPoint1.leftDirection = endPoint2.leftDirection // start 2 in = end 1 in
				//line1.strokeColor = colorFromRGB(0, 0, 255);
				var dupShape = line1.duplicate();

				// add empty point to accommodate the new ponts collection length   
				for (var k = 0; k < line2.pathPoints.length - 1; k++) {
					line1.pathPoints.add()
				}

				// reassign first points to be from line 2
				for (var k = 0; k < line2.pathPoints.length; k++) {
					var pp1 = line1.pathPoints[k];
					var p2i = line2.pathPoints[k];
					pp1.anchor = p2i.anchor;
					pp1.rightDirection = p2i.rightDirection;
					pp1.leftDirection = p2i.leftDirection;
					pp1.pointType = p2i.pointType;
					pp1.handle = p2i.handle;
				}
				// reassign remaining points to be from the duplicated original line 1
				for (var k = line2.pathPoints.length; k < line1.pathPoints.length; k++) {
					var pp1 = line1.pathPoints[k];
					var p2i = dupShape.pathPoints[Math.abs(line1.pathPoints.length-k-dupShape.pathPoints.length )];
					pp1.anchor = p2i.anchor;
					pp1.rightDirection = p2i.rightDirection;
					pp1.leftDirection = p2i.leftDirection;
					pp1.pointType = p2i.pointType;
					pp1.handle = p2i.handle;
					//$.writeln("adding");
				}

				linesToRemove.push(line2);
				dupShape.remove()
				var startPoint1 = line1.pathPoints[0];
				var endPoint1 = line1.pathPoints[1];

			}
			else if (distanceEndStart < weldThreshold) {
				//$.writeln("end of first is start of second");
				// the usual append the points of second to the first

				endPoint1.pointType = PointType.CORNER
				startPoint2.pointType = PointType.CORNER
				endPoint1.rightDirection = startPoint2.rightDirection // end 1 out = start 2 out
				startPoint2.leftDirection = endPoint1.leftDirection // start 2 in = end 1 in
				//line1.strokeColor = colorFromRGB(0, 0, 255);

				for (var k = 1; k < line2.pathPoints.length; k++) {
					var pp1 = line1.pathPoints.add()
					var p2i = line2.pathPoints[k];
					pp1.anchor = p2i.anchor;
					pp1.rightDirection = p2i.rightDirection;
					pp1.leftDirection = p2i.leftDirection;
					pp1.pointType = p2i.pointType;
					pp1.handle = p2i.handle;

				}
				linesToRemove.push(line2);
				var startPoint1 = line1.pathPoints[0];
				var endPoint1 = line1.pathPoints[1];
			}
			else if (distanceStartStart < weldThreshold) {
				//$.writeln("start 2 start")

				//$.writeln("start of first is end of second");
				// reverse line 1 and then					
				// the usual append the points of second to the first
				reverseShape(line1);
				startPoint1 = line1.pathPoints[0];
				endPoint1 = line1.pathPoints[line1.pathPoints.length - 1];
				endPoint1.pointType = PointType.CORNER
				startPoint2.pointType = PointType.CORNER
				endPoint1.rightDirection = startPoint2.rightDirection // end 1 out = start 2 out
				startPoint2.leftDirection = endPoint1.leftDirection // start 2 in = end 1 in
				//line1.strokeColor = colorFromRGB(0, 0, 255);

				for (var k = 1; k < line2.pathPoints.length; k++) {
					var pp1 = line1.pathPoints.add()
					var p2i = line2.pathPoints[k];
					pp1.anchor = p2i.anchor;
					pp1.rightDirection = p2i.rightDirection;
					pp1.leftDirection = p2i.leftDirection;
					pp1.pointType = p2i.pointType;
					pp1.handle = p2i.handle;

				}
				linesToRemove.push(line2);
				var startPoint1 = line1.pathPoints[0];
				var endPoint1 = line1.pathPoints[1];
			}
			else if (distanceEndEnd < weldThreshold) {
				//$.writeln("end 2 end")
				//$.writeln("end of first is start of second");
				// reverse line 2  and then					
				// the usual append the points of second to the first
				reverseShape(line2);
				startPoint2 = line2.pathPoints[0];
				endPoint2 = line2.pathPoints[line2.pathPoints.length - 1];
				endPoint1.pointType = PointType.CORNER
				startPoint2.pointType = PointType.CORNER
				endPoint1.rightDirection = startPoint2.rightDirection // end 1 out = start 2 out
				startPoint2.leftDirection = endPoint1.leftDirection // start 2 in = end 1 in
				//line1.strokeColor = colorFromRGB(0, 0, 255);

				for (var k = 1; k < line2.pathPoints.length; k++) {
					var pp1 = line1.pathPoints.add()
					var p2i = line2.pathPoints[k];
					pp1.anchor = p2i.anchor;
					pp1.rightDirection = p2i.rightDirection;
					pp1.leftDirection = p2i.leftDirection;
					pp1.pointType = p2i.pointType;
					pp1.handle = p2i.handle;

				}
				linesToRemove.push(line2);
				var startPoint1 = line1.pathPoints[0];
				var endPoint1 = line1.pathPoints[1];
			}
		} // end for j loop
	}// end for i loop


	for (var i = linesToRemove.length - 1; i >= 0; i--) {
		linesToRemove[i].remove();
	}

}//end func

joinSelectedLinesByClosestPoints(0.001);


