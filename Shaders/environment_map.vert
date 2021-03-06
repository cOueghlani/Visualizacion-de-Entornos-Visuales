#version 120

// Para implementar la clase environment_map, segunda parte de la práctica plus con dificultad media, me basé en los apuntes proporcionados 
// por la profesora, al igual que las explicaciones dasdas en clase y a la ayuda facilitada por la profesora mediante las tutorias y correos.
// Además de esto, accedí a: https://en.wikipedia.org/wiki/Cube_mapping para tener una ayuda extra.
// Tube problemas para la realización de esta clase y obtuve ayuda de al tutoría que realizó la profesora con mi compañero Unai.


attribute vec3 v_position;
attribute vec3 v_normal;
attribute vec2 v_texCoord;

uniform int active_lights_n; // Number of active lights (< MG_MAX_LIGHT)

uniform mat4 modelToCameraMatrix;
uniform mat4 cameraToClipMatrix;
uniform mat4 modelToWorldMatrix;
uniform mat4 modelToClipMatrix;

varying vec3 f_position;       // camera space
varying vec3 f_viewDirection;  // camera space
varying vec3 f_normal;         // camera space
varying vec2 f_texCoord;       // camera space

varying vec3 f_positionw; // world space
varying vec3 f_normalw;   // world space

void main() {

	f_position = vec3(modelToCameraMatrix * vec4(v_position, 1.0));	//positionEye

	f_positionw = vec3(modelToWorldMatrix * vec4(v_position, 1.0));

	f_viewDirection = vec3((0.0, 0.0, 0.0, 1.0) - f_position); //V

	f_normal = vec3(modelToCameraMatrix * vec4(v_normal, 0.0)); // N

	f_normalw = vec3(modelToWorldMatrix * vec4(v_normal, 0.0));

	f_texCoord= v_texCoord;

	gl_Position = modelToClipMatrix * vec4(v_position, 1.0);
}
