
    //color constants for per-weather //edited, PayodPanda
    var above95 = ["E88436", "FF7D48", "E85036"]; //brightest red, orange, yellow
    var between8595 = ["E8AD52", "FFAE67", "E88352"]; //slightly more muted red, orange, yellow
    var between7585 = ["FFD83A", "FFB546", "FF783A"];
    var between6575 = ["FFE95A", "FFCC67", "FF9E5A"]; //green, yellow-green, aqua
    var between5565 = ["92FF8B", "E6FF98", "FFF08B"]; //2 muted sea greens, blue
    var between4555 = ["87FFD4", "94FF9C", "D0FF87"]; //
    var between3545 = ["8DCFFF", "99FFF3", "8DFFB1"]; //
    var between2535 = ["828EE8", "9BC1FF", "82C4E8"]; //
    var below25 = ["82C4E8", "509EFF", "43EAFF"]; //
    
    var TIME = 60; //how many frames the animation is
    var FRAME_RATE = 5; //how many millis/frame
    var MAX_ROUNDS = 10000; //this is now how many rounds to wait before beginning the fadeout //orig=50
    var TIMEOUT = 500; //how many millis to wait before animating again (all else held constant, 500 = as soon as done flipping)
    var WEATHER_INITIALIZATION = 1500; //how many millis to wait after getting the initial weather to start animating, so colors are initializes and correct
    var WEATHER_REFRESH = 1000 * 240; //millis between checking for the weather. Currently 1 minute
    
    var stage; //the stage == the canvas element
    var points; //an array of Point objects
	
	var vertexFrom = 4; //min. number of vertices //PayodPanda
	var vertexTo = 9; //max no. of vertices //PayodPanda
    var numVertices = vertexFrom; //number of vertices/sides for this polygon initially set to min number //PayodPanda	
    var sideLength = 150; //length of the sides of the regular polygon
	
    var colors; //an array of possible colors, color-coordinated according to weather
    var inverted; //this is currently required for triangles to animate correctly. TODO can I get rid of this?
    var possibleMoves = new Array(numVertices); //will be an array of booleans; mark out polygons that went off the page
    
    $(document).ready(function() {
        getWeather(); //this initializes the colors and everything, so it needs to happen originally
        
        stage = new Stage("ivank");
		sideLength = stage.stageHeight / 3; //length of the sides of the regular polygon //PayodPanda
        
        numVertices = Math.floor(Math.random() * ((vertexTo-vertexFrom)+1) + vertexFrom); //between 4 and 9 //PayodPanda
        
        setTimeout(function() {initialize(stage)}, WEATHER_INITIALIZATION); //this is so the colours are initialized before this happens (it sometimes broke at just TIMEOUT when TIMEOUT is 500)
    });
    
    function initialize() {
        inverted = true;

        //starting place 1
        var s = makePoly();
        stage.addChild(s);
        s.rotation = -90; //rotated so that the shape sits on its flat side
        //this is now a random starting place, controlled so it's sort of in the middle of stuff
        s.x = (stage.stageWidth / 2) + Math.random() * 0;
        s.y = (stage.stageHeight / 2) + Math.random() * 0; 
        //originate all moves to okay and not off the page
        for (var i = 0; i < numVertices; i++) {
            possibleMoves[i] = true;
        }
        setTimeout(function() {animate(s)}, TIMEOUT); //animate the shape
        setTimeout(function() {fade(s, 0.5 / TIME, 0)}, TIMEOUT * MAX_ROUNDS); //fade the centre triangle, too
    }
    
    function makePoly() {
        if (points == undefined) {
            initializePoints();
        }
		
        var s = new Sprite();
        s.graphics.beginFill("0x" + colors[Math.floor(Math.random() * 3)], 0.02); //orig= 0.5
		s.graphics.lineStyle(4, "0x" + colors[Math.floor(Math.random() * 3)], 0.4); //add a stroke for visual interest //PayodPanda
		
        s.graphics.moveTo(points[0].x, points[0].y);
        for (var i = 1; i < numVertices; i++) {
            s.graphics.lineTo(points[i].x, points[i].y);
        }
        s.graphics.endFill();
        return s;
    }
    
    function initializePoints() {
        points = new Array(numVertices);
        //these numbers are creative so that the numbers later (at least for triangles) work out
        //TODO see if this still works for other polys
        points[numVertices - 1] = Point.polar(sideLength, 0);
        for (var i = 1; i < numVertices; i++) {
            points[i - 1] = Point.polar(Math.random() * sideLength, (i * 2 * Math.PI) / numVertices);  //PayodPanda
        }
    }
    
    function animate(polygon) {
        //flip three new triangles from the original, one at each position
        var polygons = new Array(numVertices);
        
        //do the flip
        for (var i = 0; i < numVertices; i++) {
            polygons[i] = flip(polygon, i);
        }
        
        inverted = !inverted; //it alternates
        
        setTimeout(function() {checkMovesAnimate(polygons)}, TIMEOUT);
    }
    
    function checkMovesAnimate(polygons) {
        //first, mark all polygons as off the page as necessary
        for (var i = 0; i < numVertices; i++) {
            if (polygons[i].x < 0 || polygons[i].x > stage.stageWidth || polygons[i].y < 0 || polygons[i].y > stage.stageHeight) {
                possibleMoves[i] = false;
                //console.log("setting move to false: " + i);
            }
            else {
                possibleMoves[i] = true;
            }
        }
    
        //this randomly chooses a triangle and prevents against animating a polygon that's off the page
        move = Math.floor(Math.random() * 3);
        //console.log(possibleMoves);
        if (possibleMoves[move] == false) {
            //console.log("tried to move to false");
            for (var i = move; i < move + numVertices; i++) {
                if (possibleMoves[i % numVertices] == true) {
                    move = i % numVertices;
                    break;
                }
            }
        }
        animate(polygons[move]);
    }
    
    /*
     * put a new triangle on top of the given one, then animate flip over the given edge
     * 0 = left
     * 1 = right
     * 2 = top/bottom
     */
    function flip(polygon, overside) {
        //make the new polygon
        var newpoly = makePoly();
        newpoly.x = polygon.x;
        newpoly.y = polygon.y;
        
        //TODO this needs to be calculated and tested for polygons besides triangles
        newpoly.rotation = (0.5+Math.random()) * 30 * ((numVertices + 1) * overside + 1);
        newpoly.scaleX = polygon.scaleX;
            
        stage.addChild(newpoly);
        
        //and this recursively animates the flip and the fade
        var posx = points[overside].x;
        var posy = points[overside].y;
        flipOver(newpoly, 2 / TIME, posx / TIME, posy / TIME, 0);
        setTimeout(function() {fade(newpoly, 0.5 / TIME, 0)}, TIMEOUT * MAX_ROUNDS);
        
        //finally, return the new polygon
        return newpoly;
    }
    
    function flipOver(poly, scale, posx, posy, timer) {
        if (timer <= TIME) {
            if (inverted) {
                poly.scaleX += scale;
                poly.x += posy;
                poly.y -= posx;
            }
            else {
                poly.scaleX -= scale;
                poly.x -= posy;
                poly.y += posx;
            }
            
            timer++;
            currTimeout = setTimeout(function(){flipOver(poly, scale, posx, posy, timer)}, FRAME_RATE); //animate again in 5 millis
        }
    }
    
    function fade(polygon, opacity, timer) {
        if (timer < TIME) {
            polygon.alpha -= opacity;
            timer++;
            currTimeout = setTimeout(function(){fade(polygon, opacity, timer)}, FRAME_RATE); //animate again in 5 millis
        }
        else {
            stage.removeChild(polygon);
        }
    }
    
    function getWeather() {
      $.simpleWeather({
        location: '27607',
        unit: 'f',
        success: function(weather) {
          //display the div with the weather in it
          $("#temperature").html("<div class='colorbox' id='box1'></div>"
				+ "<div class='colorbox' id='box2'></div>"
				+ "<div class='colorbox' id='box3'></div>&nbsp;"
				+ weather.temp + "&deg;" + weather.units.temp + "<br />"
                + weather.city + ", " + weather.region + ", " + weather.country + "<br />"
                );
         
         //get today's midpoint between sunrise and sunset (called brightest and is a Date object)
         var sunriseTime = to24Time(weather.sunrise);
         var sunsetTime = to24Time(weather.sunset);
         var sunriseDate = new Date();
            sunriseDate.setHours(sunriseTime.split(":")[0]);
            sunriseDate.setMinutes(sunriseTime.split(":")[1]);
            sunriseDate.setSeconds(0);
         var sunsetDate = new Date();
            sunsetDate.setHours(sunsetTime.split(":")[0]);
            sunsetDate.setMinutes(sunsetTime.split(":")[1]);
            sunsetDate.setSeconds(0);
         
         var midpoint = new Date((sunriseDate.getTime() + sunsetDate.getTime()) / 2);
         
         var curr = new Date();
         
         var difference = Math.abs(midpoint.getTime() - curr.getTime());
         
         //this will calculate a value between 0 (sunrise/sunset) and 1 (high noon) or possibly a negative if outside light range
         var degree = 1 - (difference / midpoint.getTime() * ((sunsetDate.getTime() - sunriseDate.getTime())) / 500);
         //console.log("Degree: " + degree);
         if (degree < 0)
            degree = 0;
			
         
         //FINALLY set the color of the background to the time of day and the temperature dav so it shows up
         var bg = Math.round(255 * degree);
		 
		 // Use HSL system to calculate color //PayodPanda
		 var bgHue = (240 + degree * 180) % 360;
		 var bgLightness = 0 + degree * 80;
		 var bgSaturation = 20 + Math.round(degree * 30);
		 
         //var txt = (bgLightness < 60) ? 200 : 20; //white if < 50% gray, black if >= 50% gray
		 var txt = (bgLightness+50)%100;
         $("body").css("background-color", "hsla(" + bgHue + ", " + bgSaturation + "%," + bgLightness + "%, 0.5)"); //Blue to Yellow to Blue //PayodPanda
		 
         //$("body").css("background", "rgb(" + bg + ", " + bg + ", " + bg + ")"); //TODO make me care about the time of day
         $("#temperature").css("color", "hsl( 0, 0%, " + txt + "%)");
         $("#attribution").css("color", "hsl( 0, 0%, " + txt + "%)");
         
          //weather.temp = TEMPERATURE; //temporary, so I can override the weather
          //now get a random color based on the current temperature
          if (weather.temp > 95)
            colors = above95;
          else if (weather.temp > 85)
            colors = between8595;
          else if (weather.temp > 75)
            colors = between7585;
          else if (weather.temp > 65)
            colors = between6575;
          else if (weather.temp > 55)
            colors = between5565;
          else if (weather.temp > 45)
            colors = between4555;
          else if (weather.temp > 35)
            colors = between3545;
          else if (weather.temp > 25)
            colors = between2535;
          else
            colors = below25;
            
          $("#box1").css("background-color", "#" + colors[0]);
          $("#box2").css("background-color", "#" + colors[1]);
          $("#box3").css("background-color", "#" + colors[2]);
          
        },
        error: function(error) {
          console.log("error getting weather");
        }
      });
      
      setTimeout(function() {getWeather()}, WEATHER_REFRESH);
    }
    
    function to24Time(input) {
        matches = input.toLowerCase().match(/(\d{1,2}):(\d{2}) ([ap]m)/);
        return (parseInt(matches[1]) + (matches[3] == 'pm' ? 12 : 0)) + ':' + matches[2] + ':00';
    }