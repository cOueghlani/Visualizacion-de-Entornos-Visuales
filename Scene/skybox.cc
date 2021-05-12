#include <vector>
#include "skybox.h"
#include "tools.h"
#include "vector3.h"
#include "trfm3D.h"
#include "renderState.h"
#include "gObjectManager.h"
#include "nodeManager.h"
#include "textureManager.h"
#include "materialManager.h"
#include "shaderManager.h"


using std::vector;
using std::string;

// TODO: create skybox object given gobject, shader name of cubemap texture.
//
// This function does the following:
//
// - Create a new material.
// - Assign cubemap texture to material.
// - Assign material to geometry object gobj
// - Create a new Node.
// - Assign shader to node.
// - Assign geometry object to node.
// - Set sky node in RenderState.
//
// Parameters are:
//
//   - gobj: geometry object to which assign the new material (which incluides
//           cubemap texture)
//   - skyshader: The sky shader.
//   - ctexname: The name of the cubemap texture.
//
// Useful functions:
//
//  - MaterialManager::instance()->create(const std::string & matName): create a
//    new material with name matName (has to be unique).
//  - Material::setTexture(Texture *tex): assign texture to material.
//  - GObject::setMaterial(Material *mat): assign material to geometry object.
//  - NodeManager::instance()->create(const std::string &nodeName): create a new
//    node with name nodeName (has to be unique).
//  - Node::attachShader(ShaderProgram *theShader): attach shader to node.
//  - Node::attachGobject(GObject *gobj ): attach geometry object to node.
//  - RenderState::instance()->setSkybox(Node * skynode): Set sky node.

void CreateSkybox(GObject *gobj,	// un objeto geom ́etrico (cubo)
				  ShaderProgram *skyshader,
				  const std::string &ctexname) { //nombre del cubo
	if (!skyshader) {
		fprintf(stderr, "[E] Skybox: no sky shader\n");
		exit(1);
	}
	Texture *ctex = TextureManager::instance()->find(ctexname);
	if (!ctex) {
		fprintf(stderr, "[E] Cubemap texture '%s' not found\n", ctexname.c_str());
		std::string S;
		for(auto it = TextureManager::instance()->begin();
			it != TextureManager::instance()->end(); ++it)
			S += "'"+it->getName() + "' ";
		fprintf(stderr, "...avaliable textures are: ( %s)\n", S.c_str());
		exit(1);
	}
	/* =================== PUT YOUR CODE HERE ====================== */


	// - Create a new material.
	Material *mat = MaterialManager::instance()->create("miMaterial"); //create a new material with name matName (has to be unique)

	// - Assign cubemap texture to material.
	mat -> Material::setTexture(ctex); //assign texture to material.

	// - Assign material to geometry object gobj
	gobj -> GObject::setMaterial(mat); //assign material to geometry object.

	// - Create a new Node.
	Node *nodo = NodeManager::instance()->create("miNodo"); //create a new node with name nodeName (has to be unique).

	// - Assign shader to node.
	nodo -> Node::attachShader( skyshader ); //attach shader to node. 
	

	// - Assign geometry object to node.
	nodo -> Node::attachGobject( gobj ); // attach geometry object to node.

	// - Set sky node in RenderState.
	RenderState::instance()->setSkybox(nodo); // Set sky node.


	/* =================== END YOUR CODE HERE ====================== */
}

// TODO: display the skybox
//
// This function does the following:
//
// - Store previous shader
// - Move Skybox to camera location, so that it always surrounds camera.
// - Disable depth test.
// - Set skybox shader
// - Draw skybox object.
// - Restore depth test
// - Set previous shader
//
// Parameters are:
//
//   - cam: The camera to render from
//
// Useful functions:
//
// - RenderState::instance()->getShader: get actual shader.
// - RenderState::instance()->setShader(ShaderProgram * shader): set shader.
// - RenderState::instance()->push(RenderState::modelview): push MODELVIEW
//   matrix.
// - RenderState::instance()->pop(RenderState::modelview): pop MODELVIEW matrix.
// - Node::getShader(): get shader attached to node.
// - Node::getGobject(): get geometry object from node.
// - GObject::draw(): draw geometry object.
// - glDisable(GL_DEPTH_TEST): disable depth testing.
// - glEnable(GL_DEPTH_TEST): disable depth testing.

void DisplaySky(Camera *cam) {

	RenderState *rs = RenderState::instance();

	Node *skynode = rs->getSkybox();
	if (!skynode) return;

	/* =================== PUT YOUR CODE HERE ====================== */

	//vector3 P = cam -> getPosition();
	Trfm3D localT;
	localT.setTrans(cam->getPosition());

	// - Almacena previous shader
	ShaderProgram *prev_shader = rs->getShader();

	// - Set skybox shader
	ShaderProgram *sky_shader = skynode-> getShader();

	// - Move Skybox to camera location, so that it always surrounds camera.

	// PUSH
	rs->push(RenderState::modelview);
	
	rs->addTrfm(RenderState::modelview, &localT);


	// - Disable depth test.
	glDisable(GL_DEPTH_TEST);

	// - Draw skybox object.
	skynode->draw();

	// - Restore depth test
	glEnable(GL_DEPTH_TEST);

	if(!sky_shader){
		fprintf(stderr, "[E] DisplaySky: el cielo no tiene Shader");
		exit(1);
	}

	// POP
	rs->pop(RenderState::modelview);

	// - Set previous shader
	rs->setShader(prev_shader);

	/* =================== END YOUR CODE HERE ====================== */
}
