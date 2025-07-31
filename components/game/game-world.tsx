"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Sky, Text, Box, Sphere, Plane } from "@react-three/drei"
import * as THREE from "three"
import { useGame } from "./game-context"

function Player() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { state, dispatch } = useGame()
  const { camera } = useThree()
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setKeys((prev) => ({ ...prev, [event.code]: true }))
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      setKeys((prev) => ({ ...prev, [event.code]: false }))
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  useFrame((_, delta) => {
    if (meshRef.current) {
      const speed = 10 * delta
      let moved = false
      const newPosition = { ...state.player.position }

      // WASD movement
      if (keys.KeyW || keys.ArrowUp) {
        newPosition.z -= speed
        moved = true
      }
      if (keys.KeyS || keys.ArrowDown) {
        newPosition.z += speed
        moved = true
      }
      if (keys.KeyA || keys.ArrowLeft) {
        newPosition.x -= speed
        moved = true
      }
      if (keys.KeyD || keys.ArrowRight) {
        newPosition.x += speed
        moved = true
      }

      if (moved) {
        dispatch({ type: "MOVE_PLAYER", position: newPosition })
      }

      // Update camera to follow player
      camera.position.lerp(
        new THREE.Vector3(state.player.position.x + 10, state.player.position.y + 10, state.player.position.z + 10),
        0.1,
      )
      camera.lookAt(state.player.position.x, state.player.position.y, state.player.position.z)
    }
  })

  return (
    <group position={[state.player.position.x, state.player.position.y, state.player.position.z]}>
      <Box ref={meshRef} args={[1, 2, 1]} onClick={() => console.log("Player clicked!")}>
        <meshStandardMaterial color="#4f46e5" />
      </Box>
      <Text position={[0, 3, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
        {state.player.name} (Lv.{state.player.level})
      </Text>
      {state.player.combatState === "combat" && (
        <Sphere args={[2]} position={[0, 0, 0]}>
          <meshStandardMaterial color="red" transparent opacity={0.3} />
        </Sphere>
      )}
    </group>
  )
}

function OtherPlayers() {
  const { state } = useGame()

  return (
    <>
      {state.otherPlayers.map((player) => (
        <group key={player.id} position={[player.position.x, player.position.y, player.position.z]}>
          <Box args={[1, 2, 1]}>
            <meshStandardMaterial color={player.pvpFlag ? "#ef4444" : "#10b981"} />
          </Box>
          <Text position={[0, 3, 0]} fontSize={0.4} color="white" anchorX="center" anchorY="middle">
            {player.name} (Lv.{player.level})
          </Text>
          {player.guild && (
            <Text position={[0, 3.5, 0]} fontSize={0.3} color="yellow" anchorX="center" anchorY="middle">
              [{player.guild}]
            </Text>
          )}
          {player.combatState === "combat" && (
            <Sphere args={[1.5]} position={[0, 0, 0]}>
              <meshStandardMaterial color="orange" transparent opacity={0.2} />
            </Sphere>
          )}
        </group>
      ))}
    </>
  )
}

function Monsters() {
  const { state, dispatch } = useGame()
  const currentRegion = state.world.regions.find((r) => r.id === state.player.currentRegion)

  const handleMonsterClick = (monsterId: string) => {
    dispatch({ type: "ENTER_COMBAT", targetId: monsterId })

    // Simulate combat
    setTimeout(() => {
      dispatch({ type: "DEFEAT_MONSTER", monsterId })
      dispatch({ type: "GAIN_EXPERIENCE", amount: 50 })
      dispatch({ type: "UPDATE_QUEST_PROGRESS", questId: "starter_quest_1", objectiveId: "kill_goblins", progress: 1 })
      dispatch({ type: "EXIT_COMBAT" })

      dispatch({
        type: "ADD_NOTIFICATION",
        notification: {
          type: "success",
          title: "Monster Defeated!",
          message: "You gained 50 experience points",
        },
      })
    }, 2000)
  }

  return (
    <>
      {currentRegion?.monsters.map((monster) => (
        <group key={monster.id} position={[monster.position.x, monster.position.y, monster.position.z]}>
          <Box
            args={[1.5, 1.5, 1.5]}
            onClick={() => handleMonsterClick(monster.id)}
            onPointerOver={(e) => {
              e.object.material.color.setHex(0xff0000)
              document.body.style.cursor = "pointer"
            }}
            onPointerOut={(e) => {
              e.object.material.color.setHex(0x8b0000)
              document.body.style.cursor = "default"
            }}
          >
            <meshStandardMaterial color="#8b0000" />
          </Box>
          <Text position={[0, 2.5, 0]} fontSize={0.4} color="red" anchorX="center" anchorY="middle">
            {monster.type} (Lv.{monster.level})
          </Text>
          <Text position={[0, 2, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
            HP: {monster.health}/{monster.maxHealth}
          </Text>
        </group>
      ))}
    </>
  )
}

function Resources() {
  const { state, dispatch } = useGame()
  const currentRegion = state.world.regions.find((r) => r.id === state.player.currentRegion)

  const handleResourceClick = (resourceId: string) => {
    const resource = currentRegion?.resources.find((r) => r.id === resourceId)
    if (!resource || resource.quantity <= 0) return

    dispatch({ type: "HARVEST_RESOURCE", resourceId })
    dispatch({
      type: "ADD_ITEM",
      item: {
        id: resource.type,
        name: resource.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        description: `Harvested ${resource.type}`,
        type: "material",
        subType: "ore",
        rarity: "common",
        level: 1,
        stackSize: 50,
        currentStack: 1,
        isNFT: false,
        soulbound: false,
        tradeable: true,
        marketListed: false,
      },
    })

    dispatch({
      type: "ADD_NOTIFICATION",
      notification: {
        type: "success",
        title: "Resource Harvested!",
        message: `You collected ${resource.type}`,
      },
    })
  }

  return (
    <>
      {currentRegion?.resources.map((resource) => (
        <group key={resource.id} position={[resource.position.x, resource.position.y, resource.position.z]}>
          <Box
            args={[2, 1, 2]}
            onClick={() => handleResourceClick(resource.id)}
            onPointerOver={(e) => {
              e.object.material.color.setHex(0xffd700)
              document.body.style.cursor = "pointer"
            }}
            onPointerOut={(e) => {
              e.object.material.color.setHex(0x8b7355)
              document.body.style.cursor = "default"
            }}
          >
            <meshStandardMaterial color="#8b7355" />
          </Box>
          <Text position={[0, 2, 0]} fontSize={0.4} color="yellow" anchorX="center" anchorY="middle">
            {resource.type.replace("_", " ")}
          </Text>
          <Text position={[0, 1.5, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
            Qty: {resource.quantity}
          </Text>
        </group>
      ))}
    </>
  )
}

function NPCs() {
  const { state, dispatch } = useGame()
  const currentRegion = state.world.regions.find((r) => r.id === state.player.currentRegion)

  const handleNPCClick = (npcId: string) => {
    const npc = currentRegion?.npcs.find((n) => n.id === npcId)
    if (!npc) return

    dispatch({ type: "INTERACT_WITH_NPC", npcId })
    dispatch({
      type: "ADD_NOTIFICATION",
      notification: {
        type: "info",
        title: `${npc.name} says:`,
        message: npc.dialogue[Math.floor(Math.random() * npc.dialogue.length)],
      },
    })
  }

  return (
    <>
      {currentRegion?.npcs.map((npc) => (
        <group key={npc.id} position={[npc.position.x, npc.position.y, npc.position.z]}>
          <Box
            args={[1, 2, 1]}
            onClick={() => handleNPCClick(npc.id)}
            onPointerOver={(e) => {
              e.object.material.color.setHex(0x00ff00)
              document.body.style.cursor = "pointer"
            }}
            onPointerOut={(e) => {
              e.object.material.color.setHex(0x0066cc)
              document.body.style.cursor = "default"
            }}
          >
            <meshStandardMaterial color="#0066cc" />
          </Box>
          <Text position={[0, 3, 0]} fontSize={0.5} color="cyan" anchorX="center" anchorY="middle">
            {npc.name}
          </Text>
          <Text position={[0, 2.5, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
            {npc.type}
          </Text>
          <Sphere args={[0.2]} position={[0, 3.5, 0]}>
            <meshStandardMaterial color="yellow" />
          </Sphere>
        </group>
      ))}
    </>
  )
}

function GameEnvironment() {
  const { state } = useGame()
  const currentRegion = state.world.regions.find((r) => r.id === state.player.currentRegion)

  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />

      {/* Ground */}
      <Plane rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} args={[200, 200]}>
        <meshStandardMaterial color="#2d5a27" />
      </Plane>

      {/* Procedural Trees */}
      {Array.from({ length: 50 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 180
        const z = (Math.random() - 0.5) * 180
        const scale = 0.8 + Math.random() * 0.4

        return (
          <group key={i} position={[x, 0, z]} scale={[scale, scale, scale]}>
            <Box args={[1, 8, 1]} position={[0, 3, 0]}>
              <meshStandardMaterial color="#8b4513" />
            </Box>
            <Sphere args={[3]} position={[0, 8, 0]}>
              <meshStandardMaterial color="#228b22" />
            </Sphere>
          </group>
        )
      })}

      {/* Dynamic Weather Effects */}
      {currentRegion?.weather === "rain" && (
        <group>
          {Array.from({ length: 100 }).map((_, i) => (
            <Box
              key={i}
              args={[0.1, 2, 0.1]}
              position={[(Math.random() - 0.5) * 100, 10 + Math.random() * 10, (Math.random() - 0.5) * 100]}
            >
              <meshStandardMaterial color="#87ceeb" transparent opacity={0.6} />
            </Box>
          ))}
        </group>
      )}

      {/* Dungeon Entrances */}
      <group position={[30, 0, 30]}>
        <Box args={[8, 6, 3]}>
          <meshStandardMaterial color="#444" />
        </Box>
        <Text position={[0, 7, 0]} fontSize={1.2} color="red" anchorX="center" anchorY="middle">
          SHADOW DUNGEON
        </Text>
        <Text position={[0, 5.5, 0]} fontSize={0.6} color="orange" anchorX="center" anchorY="middle">
          Level 5-10 • Rewards: Epic Loot
        </Text>
      </group>

      {/* Guild Territory Markers */}
      <group position={[-40, 0, -40]}>
        <Box args={[6, 8, 6]}>
          <meshStandardMaterial color="#purple" />
        </Box>
        <Text position={[0, 9, 0]} fontSize={1} color="purple" anchorX="center" anchorY="middle">
          DRAGON SLAYERS
        </Text>
        <Text position={[0, 7.5, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
          Guild Territory
        </Text>
      </group>

      {/* PvP Arena */}
      <group position={[0, 0, 50]}>
        <Plane rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]} args={[20, 20]}>
          <meshStandardMaterial color="#8b0000" />
        </Plane>
        <Text position={[0, 5, 0]} fontSize={1.5} color="red" anchorX="center" anchorY="middle">
          PVP ARENA
        </Text>
        <Text position={[0, 3, 0]} fontSize={0.8} color="yellow" anchorX="center" anchorY="middle">
          Enter at your own risk!
        </Text>
      </group>
    </>
  )
}

export function GameWorld() {
  return (
    <Canvas camera={{ position: [15, 15, 15], fov: 60 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="blue" />

      <Player />
      <OtherPlayers />
      <Monsters />
      <Resources />
      <NPCs />
      <GameEnvironment />

      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} maxDistance={50} minDistance={5} />
    </Canvas>
  )
}
