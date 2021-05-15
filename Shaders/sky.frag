#version 120

//Calcula el color del p ixel a partir de las coordenadas de textura (variablevaryingde tipovec3) y de la textura 
//mediante lafunci ́ontextureCube.

varying vec3 f_texCoord;
uniform samplerCube cubemap;

// To sample a texel from a cubemap, use "textureCube" function:
//
// vec4 textureCube(samplerCube sampler, vec3 coord);

void main() {
	vec4 textu = textureCube(cubemap, f_texCoord); //añadido
	gl_FragColor = textu; 	//modificado
}
