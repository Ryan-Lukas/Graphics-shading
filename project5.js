//Ryan J. Lukas
//u1063988
//CS 4600

// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	var sin = Math.sin;
	var cos = Math.cos;
	
	var r_x = [1,0,0,0,0,cos(-rotationX),-sin(-rotationX),0,0,sin(-rotationX),cos(-rotationX),0,0,0,0,1];
	var r_y = [cos(-rotationY),0,sin(-rotationY),0,0,1,0,0,-sin(-rotationY),0,cos(-rotationY),0,0,0,0,1];
	
	var rotation = MatrixMult(r_x,r_y);
	
	trans = MatrixMult(trans,rotation);



	var mv = trans;
	return mv;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// id matrix	
		var identityM = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];			

		// need shader prog
		this.prog = InitShaderProgram(meshVS,meshFS);

		// ids attributes
		this.vertPos = gl.getAttribLocation( this.prog,'pos');
		this.texPos = gl.getAttribLocation(this.prog,'tex');
		this.normalPos = gl.getAttribLocation(this.prog, 'norm')
		
		//ids of uniform location
		this.mvp = gl.getUniformLocation( this.prog,'mvp');
		this.identityM = gl.getUniformLocation(this.prog,'identityM');
		this.texflag = gl.getUniformLocation(this.prog,'texflag');
		this.mv = gl.getUniformLocation(this.prog,'mv');
		this.nt = gl.getUniformLocation(this.prog,'nt');
		this.ldr = gl.getUniformLocation(this.prog,'ldr');
		this.ldr_2 = gl.getUniformLocation(this.prog,'ldr_2');
		this.shin = gl.getUniformLocation(this.prog,'shin');
		
		this.vertbuffer = gl.createBuffer();
		this.texbuffer = gl.createBuffer();
		this.normalbuffer = gl.createBuffer();

		gl.useProgram(this.prog);
		gl.uniformMatrix4fv(this.identityM,false,identityM );
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		this.numTriangles = vertPos.length / 3;

		gl.bindBuffer(gl.ARRAY_BUFFER,this.vertbuffer);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertPos),gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER,this.texbuffer);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(texCoords),gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER,this.normalbuffer);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(normals),gl.STATIC_DRAW);
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		gl.useProgram(this.prog);

		if (swap){
			var m = [1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1];
		} else{
			var m = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
		}

		gl.uniformMatrix4fv(this.identityM,false,m);
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		gl.useProgram(this.prog);

		gl.uniformMatrix4fv(this.mvp,false,matrixMVP);
		gl.uniformMatrix4fv(this.mv,false,matrixMV);
		gl.uniformMatrix3fv(this.nt,false,matrixNormal);
		
		gl.bindBuffer(gl.ARRAY_BUFFER,this.vertbuffer);
		gl.vertexAttribPointer(this.vertPos,3,gl.FLOAT,false,0,0);
		gl.enableVertexAttribArray(this.vertPos);
		
		gl.bindBuffer(gl.ARRAY_BUFFER,this.texbuffer);
		gl.vertexAttribPointer(this.texPos,2,gl.FLOAT,false,0,0);
		gl.enableVertexAttribArray(this.texPos);
		
		gl.bindBuffer(gl.ARRAY_BUFFER,this.normalbuffer);
		gl.vertexAttribPointer(this.normalPos,3,gl.FLOAT,false,0,0);
		gl.enableVertexAttribArray(this.normalPos);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.linebuffer);
		

		gl.drawArrays(gl.TRIANGLES,0,this.numTriangles);
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		var texture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D,texture);
		gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);
		gl.generateMipmap(gl.TEXTURE_2D);

		gl.useProgram(this.prog);
		gl.uniform1i(this.texflag,1);
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		gl.useProgram(this.prog);
		if(show){
			gl.uniform1i(this.texflag,1);
		} else{
			gl.uniform1i(this.texflag,0);
		}
	}
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
		gl.useProgram(this.prog);
		gl.uniform3f(this.ldr,x,y,z);
		gl.uniform3f(this.ldr_2,x,y,z);
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		gl.useProgram(this.prog);
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.\
		gl.uniform1f(this.shin,shininess);
	}
}

// Vertex shader source code
var meshVS = `
	
attribute vec3 pos;
    attribute vec2 tex;
    attribute vec3 norm;
	
	uniform mat4 identityM;
    uniform mat4 mvp;
    uniform mat4 mv;     
    uniform mat3 nt;         
    uniform vec3 ldr;    
	
	varying vec2 varying_tex;
    varying vec3 v_norm;        
    varying vec3 v_view;    
    
    void main()
    {    
        gl_Position = mvp * identityM * vec4(pos,1.0);
		varying_tex = tex;
		
        v_norm = nt * mat3(identityM) * norm;
        v_view = ldr - vec3(mv * identityM * vec4(pos,1.0));     
    }
`;



// Fragment shader source code
var meshFS = `

	precision mediump float;
	
	uniform int texflag;
    uniform sampler2D uni_tex;
    uniform float shin;    
    uniform vec3 ldr_2;        
	
	varying vec2 varying_tex;
    varying vec3 v_norm;
    varying vec3 v_view;
    
    void main()
    {        
        vec3 norm =  normalize(v_norm);
        vec3 lightDir = normalize(ldr_2);
        vec3 viewDir = normalize(v_view);
		vec3 v_half= normalize(lightDir + viewDir);
		
        float light = max(dot(norm, lightDir), 0.0);
		float specular = pow(max(dot(norm, v_half), 0.0), shin);
		
        if (texflag == 1) {
            gl_FragColor = texture2D(uni_tex, varying_tex) * light + specular;
        } else  {
            gl_FragColor = vec4(1,gl_FragCoord.z*gl_FragCoord.z,0,1) * light + specular;
        }        
    }
`;
