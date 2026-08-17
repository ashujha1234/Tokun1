/**
 * The landing page's 3D globe, split out of Landing.tsx on purpose.
 *
 * This module is the only thing that pulls in three / @react-three/fiber /
 * @react-three/drei (~600 KB of JS) and it is what fetches the 7.8 MB
 * `airports_around_the_world.glb`. While it lived inside Landing.tsx all of
 * that sat on the critical path of the very first paint — including a
 * module-scope `useGLTF.preload()` that kicked off the 7.8 MB download before
 * the hero had even rendered.
 *
 * Landing now imports this lazily and only once the globe scrolls into view,
 * so the cost is paid by people who actually reach that section.
 */
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'

const GLOBE_MODEL_URL = '/models/airports_around_the_world.glb'

function GlobeModel() {
  const groupRef = useRef(null)
  const { scene } = useGLTF(GLOBE_MODEL_URL)
  const clonedScene = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    if (!clonedScene || !groupRef.current) return

    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        mats.forEach((mat) => {
          if (!mat) return
          mat.transparent = false
          mat.depthWrite = true
          if ('roughness' in mat && typeof mat.roughness === 'number') {
            mat.roughness = Math.min(mat.roughness, 0.82)
          }
          if ('metalness' in mat && typeof mat.metalness === 'number') {
            mat.metalness = Math.max(mat.metalness, 0.08)
          }
        })
      }
    })

    const box = new THREE.Box3().setFromObject(clonedScene)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    clonedScene.position.set(-center.x, -center.y, -center.z)

    const maxAxis = Math.max(size.x, size.y, size.z) || 1
    const fitScale = 2.45 / maxAxis
    groupRef.current.scale.setScalar(fitScale)
    groupRef.current.position.set(0, -0.08, 0)
  }, [clonedScene])

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  )
}

function GlobeRig() {
  const globeRef = useRef(null)
  useFrame((state) => {
    if (!globeRef.current) return
    globeRef.current.rotation.y += 0.0034
    globeRef.current.rotation.x = 0.24 + Math.sin(state.clock.elapsedTime * 0.7) * 0.02
    globeRef.current.rotation.z = -0.05 + Math.sin(state.clock.elapsedTime * 0.45) * 0.01
  })
  return (
    <group ref={globeRef} rotation={[0.24, 0.45, -0.05]}>
      <GlobeModel />
    </group>
  )
}

function GlobeScene() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <hemisphereLight args={['#cfe8ff', '#0a0d17', 0.72]} />
      <directionalLight position={[5, 4, 6]} intensity={2.0} />
      <directionalLight position={[-3, -2, -4]} intensity={0.85} color="#1A73E8" />
      <pointLight position={[2, 1, 4]} intensity={1.15} color="#FF14EF" />
      <spotLight position={[0, 6, 6]} angle={0.45} penumbra={1} intensity={1.35} color="#ffffff" />
      <Environment preset="city" />
      <GlobeRig />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        minPolarAngle={Math.PI / 2.18}
        maxPolarAngle={Math.PI / 1.84}
      />
    </>
  )
}

export default function LandingGlobeCanvas({ isMobile }: { isMobile: boolean }) {
  return (
    <Canvas
      camera={{ position: isMobile ? [0, 0.18, 7.2] : [0, 0.22, 7.0], fov: isMobile ? 26 : 24 }}
      dpr={[1, 2]}
      /* failIfMajorPerformanceCaveat: false — the browser is allowed to hand us a
         software renderer rather than refuse. A slow globe beats no globe, and
         refusing is what triggered the throw this whole section used to die on. */
      gl={{ alpha: true, failIfMajorPerformanceCaveat: false, powerPreference: 'default' }}
      style={{ background: 'transparent' }}
      onCreated={({ gl }) => {
        /* A context can be taken away after it was granted: the GPU process
           crashes or resets, or the browser reclaims one because too many tabs
           are holding contexts (Chrome allows roughly sixteen per process).

           The default behaviour on that event is for WebGL calls to start
           failing, which surfaces as a throw out of the render loop — and that
           is exactly what used to take the page down. preventDefault() marks the
           loss as handled and lets the browser restore the context if it can;
           either way the boundary in Landing.tsx now catches whatever follows,
           so the worst case is the static globe artwork. */
        gl.domElement.addEventListener(
          'webglcontextlost',
          (event) => {
            event.preventDefault()
            console.warn('[LandingGlobe] WebGL context lost — falling back to the static globe.')
          },
          { passive: false }
        )
      }}
    >
      <GlobeScene />
    </Canvas>
  )
}
