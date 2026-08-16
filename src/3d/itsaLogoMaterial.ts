import * as THREE from 'three';

export function setupITSALighting(scene: THREE.Scene): {
  keyLight: THREE.DirectionalLight;
  fillLight: THREE.PointLight;
  rimLight: THREE.PointLight;
} {
  // Ambient light for base visibility
  const ambientLight = new THREE.AmbientLight(0x051525, 1.5);
  scene.add(ambientLight);

  // Key directional light for specular highlights
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
  keyLight.position.set(5, 5, 8);
  scene.add(keyLight);

  // Fill cyan point light inside logo center
  const fillLight = new THREE.PointLight(0x00f3ff, 4, 10);
  fillLight.position.set(0, 0, 2);
  scene.add(fillLight);

  // Rim blue/violet light for edge highlights
  const rimLight = new THREE.PointLight(0x7b2cbf, 3, 10);
  rimLight.position.set(-4, -4, 3);
  scene.add(rimLight);

  return { keyLight, fillLight, rimLight };
}
