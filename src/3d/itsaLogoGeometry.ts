import * as THREE from 'three';

export function createITSALogoGroup(): THREE.Group {
  const logoGroup = new THREE.Group();

  // Material settings for physical reflective metallic structure
  const mainMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x00f3ff,
    emissive: 0x003344,
    emissiveIntensity: 0.4,
    metalness: 0.85,
    roughness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    reflectivity: 0.9,
    ior: 1.5,
    transparent: true,
    opacity: 0.95,
  });

  const coreMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    emissive: 0x00f3ff,
    emissiveIntensity: 0.8,
    metalness: 0.9,
    roughness: 0.1,
    clearcoat: 1.0,
  });

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.15,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.02,
    bevelThickness: 0.02,
  };

  // 1. Central Core Node
  const coreGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.25, 32);
  const coreMesh = new THREE.Mesh(coreGeom, coreMaterial);
  coreMesh.rotation.x = Math.PI / 2;
  logoGroup.add(coreMesh);

  // 2. Inner Ring
  const innerRingGeom = new THREE.TorusGeometry(0.5, 0.035, 16, 64);
  const innerRingMesh = new THREE.Mesh(innerRingGeom, mainMaterial);
  logoGroup.add(innerRingMesh);

  // 3. Middle Concentric Ring
  const midRingGeom = new THREE.TorusGeometry(0.85, 0.045, 16, 64);
  const midRingMesh = new THREE.Mesh(midRingGeom, mainMaterial);
  logoGroup.add(midRingMesh);

  // 4. Outer Dashed Tech Ring (12 segmented extruded arcs)
  const segments = 12;
  const radiusOuter = 1.35;
  const dashAngle = (Math.PI * 2) / segments;
  for (let i = 0; i < segments; i++) {
    if (i % 2 === 0) continue; // Create dashed gaps
    const startAngle = i * dashAngle;
    const endAngle = startAngle + dashAngle * 0.75;

    const arcShape = new THREE.Shape();
    arcShape.absarc(0, 0, radiusOuter, startAngle, endAngle, false);
    arcShape.absarc(0, 0, radiusOuter - 0.08, endAngle, startAngle, true);

    const arcGeom = new THREE.ExtrudeGeometry(arcShape, extrudeSettings);
    arcGeom.center();
    const arcMesh = new THREE.Mesh(arcGeom, mainMaterial);
    
    // Position centered around origin
    const midAngle = (startAngle + endAngle) / 2;
    const rMid = radiusOuter - 0.04;
    arcMesh.position.set(Math.cos(midAngle) * rMid, Math.sin(midAngle) * rMid, 0);
    arcMesh.rotation.z = midAngle;

    logoGroup.add(arcMesh);
  }

  // 5. Crosshair Notches (Top, Bottom, Left, Right 3D Bars)
  const notchLength = 0.45;
  const notchWidth = 0.08;
  const notchDist = 1.6;

  const notchShape = new THREE.Shape();
  notchShape.moveTo(-notchWidth / 2, 0);
  notchShape.lineTo(notchWidth / 2, 0);
  notchShape.lineTo(notchWidth / 2, notchLength);
  notchShape.lineTo(-notchWidth / 2, notchLength);
  notchShape.closePath();

  const notchGeom = new THREE.ExtrudeGeometry(notchShape, extrudeSettings);

  // Top
  const topNotch = new THREE.Mesh(notchGeom, mainMaterial);
  topNotch.position.set(0, notchDist, -0.075);
  logoGroup.add(topNotch);

  // Bottom
  const bottomNotch = new THREE.Mesh(notchGeom, mainMaterial);
  bottomNotch.position.set(0, -notchDist - notchLength, -0.075);
  logoGroup.add(bottomNotch);

  // Right
  const rightNotch = new THREE.Mesh(notchGeom, mainMaterial);
  rightNotch.rotation.z = -Math.PI / 2;
  rightNotch.position.set(notchDist, 0, -0.075);
  logoGroup.add(rightNotch);

  // Left
  const leftNotch = new THREE.Mesh(notchGeom, mainMaterial);
  leftNotch.rotation.z = Math.PI / 2;
  leftNotch.position.set(-notchDist, 0, -0.075);
  logoGroup.add(leftNotch);

  return logoGroup;
}
