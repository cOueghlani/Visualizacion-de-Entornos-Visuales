#version 120

// Elvertex-shaderle pasa las coordenadas de la textura alfragment-shadermediante la variablevaryingdenominadaftexCoord(de tipovec3).  
// Estas coordenadas deben ser la posicion del vertice pero transformada al espacio levogiro (esto es, debemos cambiar elsigno de la 
// coordenadaZ).


uniform mat4 modelToCameraMatrix;
uniform mat4 cameraToClipMatrix;
uniform mat4 modelToWorldMatrix;
uniform mat4 modelToClipMatrix;

attribute vec3 v_position;

varying vec3 f_texCoord; // Note: texture coordinates is vec3

void main() {

	f_texCoord.xyz = v_position.xyz; //añadido

	f_texCoord.z =  -f_texCoord.z; //añadido

	gl_Position = modelToClipMatrix * vec4(v_position, 1.0);
}
