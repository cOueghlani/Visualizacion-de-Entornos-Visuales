#version 120

// Para implementar la clase environment_map, segunda parte de la práctica plus con dificultad media, me basé en los apuntes proporcionados 
// por la profesora, al igual que las explicaciones dasdas en clase y a la ayuda facilitada por la profesora mediante las tutorias y correos.
// Además de esto, accedí a: https://en.wikipedia.org/wiki/Cube_mapping para tener una ayuda extra.
// Tube problemas para la realización de esta clase y obtuve ayuda de al tutoría que realizó la profesora con mi compañero Unai.


uniform int active_lights_n; // Number of active lights (< MG_MAX_LIGHT)
uniform vec3 scene_ambient; // Scene ambient light

uniform struct light_t {
	vec4 position;    // Camera space
	vec3 diffuse;     // rgb
	vec3 specular;    // rgb
	vec3 attenuation; // (constant, lineal, quadratic)
	vec3 spotDir;     // Camera space
	float cosCutOff;  // cutOff cosine
	float exponent;
} theLights[4];     // MG_MAX_LIGHTS

uniform struct material_t {
	vec3  diffuse;
	vec3  specular;
	float alpha;
	float shininess;
} theMaterial;

uniform vec3 campos; // Camera position in world space

uniform sampler2D texture0;   // Texture
uniform samplerCube envmap;   // Environment map (cubemap)

varying vec3 f_position;      // camera space
varying vec3 f_viewDirection; // camera space
varying vec3 f_normal;        // camera space
varying vec2 f_texCoord;
varying vec3 f_positionw;    // world space
varying vec3 f_normalw;      // world space


// Calcula el lambert_factor -> en clase
float lambert_factor(in vec3 n, in vec3 l){
	return dot(n, l);
}



/* Calcula el specular_factor -> en clase
	* La normal del vertice
	* La direccion donde esta la luz
	* La direccion donde esta la camara
*/
 float specular_factor(in vec3 n, in vec3 l, in vec3 v, in float m){
	vec3 r;
	float NoL, RoV;

	NoL = dot(n, l);

	r = normalize(2.0 * NoL * n-l); //normalizo por si las moscas

	RoV = dot(r,v);

	if (RoV > 0.0) {
		return pow(RoV, m);
	} else{
		return 0.0; //es mate (tipo de material)
	}
 }



void luz_direccional (in int i,in vec3 L,in vec3 N,in vec3 V, inout vec3 color_difuso, inout vec3 color_especular){
	
	//Componente difusa
	float NoL = lambert_factor(N,L);

	if(NoL > 0.0){
		color_difuso += theLights[i].diffuse * theMaterial.diffuse * NoL;

		//Componente especular
		float f_specular = specular_factor(N, L, V, theMaterial.shininess);

		color_especular += theLights[i].specular * theMaterial.specular * f_specular * NoL; 
	}
}


void luz_positional(in int i,in vec3 L,in vec3 N,in vec3 V, inout vec3 color_difuso, inout vec3 color_especular, float att){

	//Componente difusa
	float NoL = lambert_factor(N,L);
	
	if(NoL > 0.0){
		color_difuso += theLights[i].diffuse * theMaterial.diffuse * NoL*att;

		//Componente especular
		float f_specular = specular_factor(N, L, V, theMaterial.shininess);

		color_especular += theLights[i].specular * theMaterial.specular * f_specular * NoL*att; 
	}
}

void luz_spot(in int i, in vec3 L,in vec3 N,in vec3 V, inout vec3 color_difuso, inout vec3 color_especular){

	vec3 dir_foco= normalize(theLights[i].spotDir);

	float fac_int = dot(-L, dir_foco);
	
	float cspot = 0.0; //Factor de intensidad del foco

	//Componente difusa
	float NoL = lambert_factor(N,L);


	if(NoL>0.0){

		//Si el angulo es >0 y está DENTRO DEL ANGULO DEL FOCO --> modificar el factor
		if(fac_int >= theLights[i].cosCutOff){

			if(fac_int > 0.0){
				cspot = pow(fac_int, theLights[i].exponent);
			}

			if(cspot > 0.0){
				color_difuso += theLights[i].diffuse * theMaterial.diffuse * NoL *cspot;

				//Componente especular
				float f_specular = specular_factor (N,L,V,theMaterial.shininess);

				color_especular += theLights[i].specular * theMaterial.specular * f_specular * NoL * cspot; 
				
			}
		}
	}
}


void main() {

	//Basado en pervertex.vert:

	vec3 L,N,V,Ln,I,nw, R;
	vec4 L4, N4, positionEye, V4, texcu;
	

	//Añadido desde aqui:
	I = normalize(campos - f_positionw); //f_positionw -->posicion_pixel_en_el_mundo 
	nw = normalize(f_normalw); //nw --> Normal del v ́ertice en el sistema de coordenadas del mundo
	R =  2 * dot(nw, I) * nw - I;

	R.z = -R.z; //sistema levógiro

	texcu = textureCube(envmap, R);//textura del cubemap

	//Hasta aquí


	//Normal del vertice del espacio del modelo al espacio de la camara
	N = normalize(f_normal);

	V= normalize(f_viewDirection);

	float att=1.0; //atenuacion es reduccion --> atenuacion a 1 esta APAGADA

	//acumuladores donde voy dejando el color
	vec3 color_difuso = vec3(0.0, 0.0, 0.0); //tambien se puede poner -> vec3 color_difuso = vec3(0.0);
	vec3 color_especular = vec3(0.0, 0.0, 0.0);

	for(int i= 0; i<active_lights_n; i++){

		//Mirar si la luz es DIRECCIONAL
		if(theLights[i].position[3] == 0.0){
			L4 = (-1.0) * theLights[i].position; //(-1.0) es el opuesto(rebota)
			L = normalize(L4.xyz);
			luz_direccional(i,L,N,V, color_difuso, color_especular);
		
		//Mirar SI la luz es POSICIONAL Y SPOTLIGHT
		} else {

			L = (theLights[i].position - vec4(f_position, 1.0)).xyz; //1º modificado de positionEye a f_position 
			float d = length(L);						 //2º -->Consigo la distancia entre 2 puntos
			L=normalize(L); 							//3!
			
			// Si la luz es POSICIONAL (O point)
			if (theLights[i].cosCutOff > 0.0) {
				
				//Luz SPOT
				luz_spot(i, L, N, V, color_difuso, color_especular);
				
			}else{
				
				//ATENUACION
				att = theLights[i].attenuation[0] + theLights[i].attenuation[1] *d + theLights[i].attenuation[2]*d*d;
				if(att>0.0){
					att = 1/att;
				}
			
				luz_positional(i, L, N, V, color_difuso, color_especular, att);

			}


			//mirar transparencias ->cspot  *color
		}
	}

	vec4 color = vec4(scene_ambient + color_difuso + color_especular, 1.0);
	vec4 text_color = texture2D(texture0, f_texCoord);
	vec4 mezcla = mix(text_color, texcu, 0.8);
	

    gl_FragColor = vec4(scene_ambient + color_difuso, 1.0) * mezcla + vec4(color_especular, theMaterial.alpha);
}