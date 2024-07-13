
Icosahedron
	.geometry(geo)
	.subdivTriangle2(geo,3)
	.toSphere(geo,2)
	.mapVertFace(geo,vmap)
	.sortVertFace(geo,vmap)
	.createFanTiles(geo,vmap,finalGeo,tiles)
	.centerTileUV(finalGeo,tiles)


//https://en.wikipedia.org/wiki/Geodesic_polyhedron
class Icosahedron{
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//Setup the Initial Values of Verts and Faces to buuild an icosahedron
	static geometry(geo){
		//var t = Math.sqrt(5) * 0.5 + 0.5; // 0.5 + Math.sqrt(5) / 2
		var t = 1.618033988749895;
		geo.addVert(
			-1,  t,  0, //Z Plane orthogonal rectangles (Vertical)
				1,  t,  0,
			-1, -t,  0,
				1, -t,  0,

				0, -1,  t, //X Plane orthogonal rectangles
				0,  1,  t,
				0, -1, -t,
				0,  1, -t,

				t,  0, -1, // Y Plane orthogonal rectangles
				t,  0,  1,
			-t,  0, -1,
			-t,  0,  1
		).addFace(
			0, 11, 5,	// 5 faces around point 0
			0, 5, 1,
			0, 1, 7,
			0, 7, 10,
			0, 10, 11,

			1, 5, 9,	// 5 adjacent faces
			5, 11, 4,
			11, 10, 2,
			10, 7, 6,
			7, 1, 8,

			3, 9, 4,	// 5 faces around point 3
			3, 4, 2,
			3, 2, 6,
			3, 6, 8,
			3, 8, 9,

			4, 9, 5,	// 5 adjacent faces
			2, 4, 11,
			6, 2, 10,
			8, 6, 7,
			9, 8, 1
			/**/
		);
		return Icosahedron;
	}

	static mapVertFace(geo, vmap){
		var i,f,pos;
		for(i=0; i < geo.verts.length; i++) vmap[i] = new Array();

		//For every vert, save which face it belongs to.
		//Sort the Verts for each face, so the center point is
		//the first element.
		for(var face of geo.faces){

			for(var i=0; i < 3; i++){
				f	= face.clone();					//Clone face since we want to modify it
				pos	= f.indexOf( face[i] );			//Get where in the array the point exists in the face
				
				if(pos != 0) f.moveToStart(pos);	//Reorange face so point is at index zero
				vmap[ face[i] ].push(f);			//Save face to a list of that specific point
			}

		}
		return Icosahedron;
	}

	static sortVertFace(geo, vmap){
		var oList,	// New Ordered List
			list,	// Old List
			a,b,	// Vert Index looking for
			face,	// Reference Face that the look is checking
			i,		// Loop Index
			p;		// New list array position		

		for(var m=0; m < vmap.length; m++){
			list 		= vmap[m];					// Ref
			oList		= new Array(list.length);	// New Sorted Face List
			oList[0]	= list[0];					// Use the first face from the original list
			a 			= list[0][0];				// Grab the Side Points
			b 			= list[0][1];
			p			= 1;						// Forward Index for oList, p for Point
			i			= 0;						// Index for List, gets reset every time we find a triangle
			list.splice(0,1);						// Remove the first face the old list.

			//console.log("look for",a,b);
			//console.log(list);

			while(list.length > 0 && i < list.length){
				face = list[i]; //Get Reference to face

				if(face.indexOf(a) != -1 && face.indexOf(b) != -1){
					list.splice(i,1);		//Remove face from original list
					oList[p++]	= face;		//Save face to ordered list
					a 			= face[0];	//Set the indexes for the next search
					b			= face[1];
					i			= 0;		//Reset index to start from the beginning of list
					continue;				//Reset loop to beginning
				}

				i++; //If neighbor not found, move on to next triangle on the list.
			}

			// Save Sorted Faces back to Map;
			vmap[m] = oList;
		}
		return Icosahedron;
	}

	static createFanTiles(geo, vmap, geoOut, tiles){
		var fcPnt = [0,0,0],		//Centroid of Triangle Face
			key = "",				//Cache Key
			cache = new Map(),		//Keep Track of Vertex to not repeat them.
			ip,						//Index of current point
			i,						//Index
			cp,						//Index of Center Point of Tile
			vCnt = 0,				//Current Vertex Count in geoOut
			vArg = new Vector3(),	//Calc Centroid of tile
			edge = [];				//Vertex Index Array for tile

		for(var face of vmap){
			geoOut.addVert( face[0].vert(0) );	//Add Center of tile to new geo
			cp = vCnt++;						//Incement Vertex Count

			edge.splice(0);						//Clear out Array
			vArg.set(0,0,0);					//Reset Tile Centroid Averge

			var tile = new Array();
			
			//Fungi.debugPoint.addVecPoint( face[0].vert(0) , 1 );

			for(i=0; i < face.length; i++){
				face[i].centroid(fcPnt);
				key = fcPnt[0].toFixed(3) + "_" + fcPnt[1].toFixed(3) + "_" + fcPnt[2].toFixed(3);
				
				//Has the centroid been added to geometry already
				if(cache.has(key)){ ip = cache.get(key); }//Get its index;
				else{ //Create new Vertex
					ip = vCnt++;
					cache.set(key,ip);
					geoOut.addVert(fcPnt);
				}

				edge[i] = ip;		//Add Vertex Index of Edge list
				vArg.add( fcPnt );	//Add up the points to calc centroid
				//Fungi.debugPoint.addVecPoint( fcPnt , 0 );
				
				//Create face when we have at least 2 edge points
				if(i > 0){
					tile.push( geoOut.faces.length );
					geoOut.addFace(cp, edge[i], edge[i-1]);
				}
			}

			tile.push( geoOut.faces.length );		//Add Face to tile
			geoOut.addFace(cp, edge[0], edge[i-1]);	//Create file face in the title
			vArg.avg(face.length, geoOut.verts[cp]);			//Averge the center point, save results to Vertex
			
			tiles.push(tile);						//Save file to tile list
			//break;
		}
		return Icosahedron;
	}

	static createTiles(geo, vmap, geoOut, tiles){
		var fcPnt = [0,0,0],		//Centroid of Triangle Face
			key = "",				//Cache Key
			cache = new Map(),		//Keep Track of Vertex to not repeat them.
			ip,						//Index of current point
			i,						//Index
			vCnt = 0,				//Current Vertex Count in geoOut
			edge = [];				//Vertex Index Array for tile

		for(var face of vmap){
			edge.splice(0);			//Clear out Array
			//Fungi.debugPoint.addVecPoint( face[0].vert(0) , 1 );

			var tile = new Array();

			for(i=0; i < face.length; i++){
				face[i].centroid(fcPnt);
				key = fcPnt[0].toFixed(3) + "_" + fcPnt[1].toFixed(3) + "_" + fcPnt[2].toFixed(3);
				
				//Has the centroid been added to geometry already
				if(cache.has(key)){ ip = cache.get(key); }//Get its index;
				else{ //Create new Vertex
					ip = vCnt++;
					cache.set(key,ip);
					geoOut.addVert(fcPnt);
				}

				edge[i] = ip;		//Add Vertex Index of Edge list
				//Fungi.debugPoint.addVecPoint( fcPnt , 0 );
				
				//Create face when we have at least 2 edge points
				if(i > 1){
					tile.push( geoOut.faces.length );
					geoOut.addFace(edge[0], edge[i], edge[i-1]);
				}
			}

			tiles.push(tile); //Save file to tile list
			//break;
		}
		return Icosahedron;
	}

	static subdivEdge(geo,a,b,div=1,cache){
		var tDivInv	= 1 / (div + 1), //Alway plus one, Because divide one segment creates 2 segments
			idx		= geo.verts.length,
			rtn		= [a],
			v0		= geo.verts[a], //Convert Index Value to actual Vector3
			v1		= geo.verts[b],
			tm1,	// T Minus 1
			ckey,	// Cache Key
			x, y, z, t;

		//Linear Interpolation : (1 - t) * v0 + t * v1;
		for(var i=1; i <= div; i++){
			t		= i * tDivInv;
			tm1		= 1 - t;

			x		= v0[0] * tm1 + v1[0] * t;
			y		= v0[1] * tm1 + v1[1] * t;
			z		= v0[2] * tm1 + v1[2] * t;
			ckey	= x.toFixed(3) + "," + y.toFixed(3) + "," + z.toFixed(3); //Fix the values because of floating point errors

			if(cache[ckey] != undefined) rtn.push( cache[ckey] ); 
			else{
				geo.addVert(x, y, z);	
				cache[ ckey ] = idx;
				rtn.push(idx++); //add index then inc.
			}
		}

		rtn.push(b); //Dont bother doing math on last point, just add index to it.
		return rtn;
	}

	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		Sub divide triangle faces in a Geometry Object
			A       Row 0
			/__\     Row 1
			/\/\/\    Row 2
			/\/\/\/\   Row 3
		B--------C

		Subdivide the sides A-B, A-C, then loop threw each point to create
		new points between AB[1] to AC[1] for example. Create a row between each
		points on the sides, after row 0, start sub dividing it by its row number.
		https://en.wikipedia.org/wiki/Geodesic_polyhedron
	*/
	static subdivTriangle2(geo, div=1){
		var faces = [],
			cache = {},
			eLeft, eRight,
			topLine, botLine,
			d,t,tMax;

		for(var face of geo.faces){
			eLeft	= Icosahedron.subdivEdge(geo, face[0], face[1], div, cache); //Divixde Left Side
			eRight	= Icosahedron.subdivEdge(geo, face[0], face[2], div, cache); //Divide Right Side
			topLine = [ eLeft[1], eRight[1] ];	//Starting Top Line for Triangle Row

			faces.push( new Face(geo, face[0], eLeft[1], eRight[1] ) ); //Create First Triangle

			//Create triangles one row at a time
			for(d=1; d <= div; d++){
				//Determine the bottom verts for the row
				botLine	= Icosahedron.subdivEdge(geo, eLeft[d+1], eRight[d+1], d, cache);
				tMax	= topLine.length - 1;

				//Using the top line as the interator to connect to the bottom line.
				//Build two triangles at a time, as long as there is enough verts for the second one.
				for(t=0; t <= tMax; t++){
					faces.push( new Face(geo, topLine[t], botLine[t], botLine[t+1] ) );	
					if(t < tMax) faces.push( new Face(geo, topLine[t], botLine[t+1], topLine[t+1] ) );
				}

				topLine	= botLine; //Setup to triangulate the next row
			}

			//Fungi.debugPoint.addVecPoint(face.vert(0),0);
			//Fungi.debugPoint.addVecPoint(face.vert(1),2);
			//Fungi.debugPoint.addVecPoint(face.vert(2),6);
			//break;
		}
		geo.faces = faces; //Replace geo with the new faces.

		return Icosahedron;
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//normalize the vertices so its becomes a sphere
	static toSphere(geo, radius = 1){
		var d, v = geo.verts;
		for(var i=0; i < v.length; i++){
			d = 1 / Math.sqrt( v[i][0]*v[i][0] + v[i][1]*v[i][1] + v[i][2]*v[i][2] ); // Vector Length

			v[i].norm[0] = v[i].x *= d; //Normalize Vertex, Also Save it as Normal Vector
			v[i].norm[1] = v[i].y *= d;
			v[i].norm[2] = v[i].z *= d;

			if(radius != 1){
				v[i].x *= radius;
				v[i].y *= radius;
				v[i].z *= radius;
			}
		}
		return Icosahedron;
	}


	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	static debugHex(geo,tiles){
		for(var ary of tiles){
			if(ary.length < 6) continue;
			for(var i=0; i < ary.length; i++){
				Fungi.debugLine.addVecLine(
					geo.faceVert(ary[i],1), 1,
					geo.faceVert(ary[i],2), 1
				);
			}
		}
		return Icosahedron;
	}

	static debugPent(geo,tiles){
		for(var ary of tiles){
			if(ary.length != 5) continue;
			for(var i=0; i < ary.length; i++){
				Fungi.debugLine.addVecLine(
					geo.faceVert(ary[i],1), 1,
					geo.faceVert(ary[i],2), 1
				);
			}
		}
		return Icosahedron;
	}

	static centerTileLen(geo,tiles, len = 1){
		for(var i=0; i < tiles.length; i++){
			var v = geo.faceVert(tiles[i][0], 0);
			v.normalize(v.norm).scale(len,v);
			//v.x = v.norm.x * len;
			//v.y = v.norm.y * len;
			//v.z = v.norm.z * len;
		}
		return Icosahedron;
	}

	static centerTileUV(geo,tiles){
		var v;
		for(var tile of tiles){
			geo.faceVert(tile[0], 0).uv.set(1,1);
			for(var i=0; i < tile.length; i++) geo.faceVert(tile[i], 1).uv.set(0,0);
		}
		return Icosahedron;
	}
}