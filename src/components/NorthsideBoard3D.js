import React,{Suspense,useEffect,useMemo,useRef}from"react";
import{Canvas,useFrame}from"@react-three/fiber";
import{ContactShadows,Html,PresentationControls,RoundedBox}from"@react-three/drei";
import{Physics,RigidBody,CuboidCollider}from"@react-three/rapier";
import*as THREE from"three";

const TOWNS=[
{name:"GEORGINA",p:[-3.8,.38,-2.8],c:"#51764a"},
{name:"EAST GWILLIMBURY",p:[0,.38,-3.25],c:"#6f965c"},
{name:"NEWMARKET",p:[3.7,.38,-2.7],c:"#496c50"},
{name:"UXBRIDGE",p:[-4.4,.38,.1],c:"#617f4e"},
{name:"AURORA",p:[4.4,.38,.15],c:"#7b8f5b"},
{name:"SCUGOG",p:[-3.7,.38,2.9],c:"#4c7863"},
{name:"STOUFFVILLE",p:[3.75,.38,2.9],c:"#6f8550"}];

function House({x=0,z=0,scale=1}){
 return <group position={[x,.4,z]} scale={scale}>
  <mesh castShadow position={[0,.34,0]}><boxGeometry args={[.72,.62,.58]}/><meshStandardMaterial color="#d9c39e" roughness={.7}/></mesh>
  <mesh castShadow position={[0,.72,0]} rotation={[0,Math.PI/4,0]}><coneGeometry args={[.55,.45,4]}/><meshStandardMaterial color="#493b30" roughness={.8}/></mesh>
  <mesh position={[0,.28,.296]}><boxGeometry args={[.15,.34,.02]}/><meshStandardMaterial color="#33281f"/></mesh>
  <mesh position={[-.22,.4,.3]}><boxGeometry args={[.13,.14,.02]}/><meshStandardMaterial color="#ffe6a8" emissive="#b88736" emissiveIntensity={.45}/></mesh>
  <mesh position={[.22,.4,.3]}><boxGeometry args={[.13,.14,.02]}/><meshStandardMaterial color="#ffe6a8" emissive="#b88736" emissiveIntensity={.45}/></mesh>
 </group>
}

function Property({town,index,revealed}){
 return <group position={town.p}>
  <RoundedBox args={[2.75,.18,1.75]} radius={.08} smoothness={3} castShadow receiveShadow>
   <meshStandardMaterial color="#eee3c8" roughness={.88}/>
  </RoundedBox>
  <mesh position={[0,.12,-.73]}><boxGeometry args={[2.68,.05,.2]}/><meshStandardMaterial color={town.c}/></mesh>
  <House z={.05} scale={revealed?1.1:.92}/>
  <Html transform position={[0,.18,.67]} rotation={[-Math.PI/2,0,0]} center distanceFactor={8}>
   <div className="board-town-label">{town.name}</div>
  </Html>
 </group>
}

function Lake(){
 const shape=useMemo(()=>{const s=new THREE.Shape();s.moveTo(-2.2,-1.5);s.bezierCurveTo(-3.1,-.6,-2.5,1.7,-.7,2.05);s.bezierCurveTo(1.2,2.4,2.8,1.3,2.5,-.45);s.bezierCurveTo(2.25,-1.9,.1,-2.45,-2.2,-1.5);return s},[]);
 return <mesh position={[0,.2,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><shapeGeometry args={[shape,48]}/><meshPhysicalMaterial color="#287888" roughness={.18} metalness={.05} transmission={.08} clearcoat={.75}/></mesh>
}

function Die({position,impulse,torque,rolling,index}){
 const ref=useRef();
 useEffect(()=>{if(rolling&&ref.current){ref.current.setTranslation({x:position[0],y:3.8+index*.3,z:position[2]},true);ref.current.setLinvel({x:0,y:0,z:0},true);ref.current.setAngvel({x:0,y:0,z:0},true);ref.current.applyImpulse(impulse,true);ref.current.applyTorqueImpulse(torque,true)}},[rolling]);
 return <RigidBody ref={ref} position={position} colliders="cuboid" restitution={.5} friction={.72} linearDamping={.08} angularDamping={.12}>
  <RoundedBox args={[.68,.68,.68]} radius={.1} smoothness={4} castShadow><meshStandardMaterial color="#f6f1e5" roughness={.38}/></RoundedBox>
  {[[0,.351,0],[0,-.351,0],[.351,0,0],[-.351,0,0],[0,0,.351],[0,0,-.351]].map((p,i)=><mesh key={i} position={p} rotation={i<2?[-Math.PI/2,0,0]:i<4?[0,Math.PI/2,0]:[0,0,0]}><circleGeometry args={[.055,20]}/><meshStandardMaterial color="#151515"/></mesh>)}
 </RigidBody>
}

function CameraRig({rolling,revealed}){
 useFrame(({camera},delta)=>{const target=rolling?new THREE.Vector3(0,6.2,7.2):revealed?new THREE.Vector3(0,6.8,8.2):new THREE.Vector3(0,7.2,8.6);camera.position.lerp(target,1-Math.pow(.002,delta));camera.lookAt(0,0,0)});
 return null
}

function BoardScene({rolling,revealed}){
 return <group rotation={[0,-.02,0]}>
  <RoundedBox args={[11.5,.5,8.5]} radius={.16} smoothness={4} position={[0,0,0]} castShadow receiveShadow><meshStandardMaterial color="#35281d" roughness={.78}/></RoundedBox>
  <RoundedBox args={[10.95,.18,7.95]} radius={.08} smoothness={3} position={[0,.34,0]} receiveShadow><meshStandardMaterial color="#c9bea3" roughness={.92}/></RoundedBox>
  <Lake/>
  {TOWNS.map((t,i)=><Property key={t.name} town={t} index={i} revealed={revealed}/>)}
  <group position={[-.5,.38,3.05]}><RoundedBox args={[2.2,.16,1.4]} radius={.06}><meshStandardMaterial color="#eee3c8"/></RoundedBox><Html transform position={[0,.12,.18]} rotation={[-Math.PI/2,0,0]} center distanceFactor={8}><div className="board-start"><small>START HERE</small><b>TORONTO</b></div></Html></group>
  <group position={[0,.55,.15]} rotation={[0,-.08,0]}><RoundedBox args={[2.25,.22,1.35]} radius={.08} castShadow><meshStandardMaterial color="#f3ead7"/></RoundedBox><Html transform position={[0,.14,0]} rotation={[-Math.PI/2,0,0]} center distanceFactor={8}><div className="board-center"><small>WHAT'S</small><b>POSSIBLE?</b></div></Html></group>
  <Physics gravity={[0,-12,0]}>
   <RigidBody type="fixed"><CuboidCollider args={[5.6,.15,4.1]} position={[0,.48,0]}/></RigidBody>
   <RigidBody type="fixed"><CuboidCollider args={[.18,.7,4.15]} position={[-5.55,1,0]}/><CuboidCollider args={[.18,.7,4.15]} position={[5.55,1,0]}/><CuboidCollider args={[5.55,.7,.18]} position={[0,1,-4.05]}/><CuboidCollider args={[5.55,.7,.18]} position={[0,1,4.05]}/></RigidBody>
   <Die index={0} rolling={rolling} position={[-1.2,1.3,2]} impulse={{x:1.7,y:3.8,z:-2.5}} torque={{x:4.5,y:2.8,z:5.8}}/>
   <Die index={1} rolling={rolling} position={[.1,1.4,2.3]} impulse={{x:-.7,y:4.2,z:-2.9}} torque={{x:-5.2,y:4.1,z:3.7}}/>
  </Physics>
 </group>
}

export default function NorthsideBoard3D({rolling=false,revealed=false}){
 return <div className="pyb-canvas-wrap">
  <Canvas shadows dpr={[1,1.35]} camera={{position:[0,7.2,8.6],fov:43}} gl={{antialias:true,toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.35}}>
   <color attach="background" args={["#17130f"]}/>
   <fog attach="fog" args={["#17130f",15,25]}/>
   <hemisphereLight intensity={1.25} color="#fff2d6" groundColor="#332417"/><ambientLight intensity={1.15}/><directionalLight castShadow position={[-4,9,5]} intensity={3.1} color="#ffd9a8" shadow-mapSize={[1024,1024]}/><pointLight position={[5,5,-3]} intensity={1.8} color="#d9e7ff"/>
   <Suspense fallback={null}><PresentationControls global polar={[-.08,.18]} azimuth={[-.18,.18]} config={{mass:2,tension:240}} snap={{mass:3,tension:220}}><BoardScene rolling={rolling} revealed={revealed}/></PresentationControls><ContactShadows position={[0,-.3,0]} opacity={.55} scale={16} blur={2.4} far={7}/></Suspense>
   <CameraRig rolling={rolling} revealed={revealed}/>
  </Canvas>
  <div className="pyb-canvas-vignette"/>
  <div className="pyb-board-hint">DRAG TO LOOK AROUND</div>
 </div>
}