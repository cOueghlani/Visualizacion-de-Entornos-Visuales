#include "tools.h"
#include "avatar.h"
#include "scene.h"

Avatar::Avatar(const std::string &name, Camera * cam, float radius) :
	m_name(name), m_cam(cam), m_walk(false) {
	Vector3 P = cam->getPosition();
	m_bsph = new BSphere(P, radius);
}

Avatar::~Avatar() {
	delete m_bsph;
}

void Avatar::setCamera(Camera *thecam) {
	m_cam = thecam;
}

Camera *Avatar::getCamera() const {
	return m_cam;
}


bool Avatar::walkOrFly(bool walkOrFly) {
	bool walk = m_walk;
	m_walk = walkOrFly;
	return walk;
}

bool Avatar::getWalkorFly() const {
	return m_walk;
}

//
// AdvanceAvatar: advance 'step' units
//
// @@ TODO: Change function to check for collisions. If the destination of
// avatar collides with scene, do nothing.
//
// Return: true if the avatar moved, false if not.

bool Avatar::advance(float step) {

	Node *rootNode = Scene::instance()->rootNode();

	/// Muevo camara
	if (m_walk)
		m_cam->walk(step);
	else
		m_cam->fly(step);

	//Colocar la esfera en la posicion nueva de la camara
	// COMPROBAR SI HAY COLISION DE LA camara(esfera) CON EL GRAFO DE LA ESCENA
	m_bsph->setPosition(m_cam->getPosition()); 

	// Si hay colision entre esfera y el grafo(BBox del nodo raiz)
	// Llamar a const Node *Node::checkCollision
	if(rootNode->checkCollision(m_bsph) != 0) { 
			// Muevo camara para atras
			if (m_walk)
				m_cam->walk(-step);
			else
				m_cam->fly(-step);

	//Si no hay colision
	} else {
		//No hago nada
		return true;
	}

	return true;
}

void Avatar::leftRight(float angle) {
	if (m_walk)
		m_cam->viewYWorld(angle);
	else
		m_cam->yaw(angle);
}

void Avatar::upDown(float angle) {
	m_cam->pitch(angle);
}

void Avatar::panX(float step) {
	m_cam->panX(step);
}

void Avatar::panY(float step) {
	m_cam->panY(step);
}

void Avatar::print() const { }
