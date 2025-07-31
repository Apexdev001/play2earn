"use client"

import { useState } from "react"
import { GameProvider } from "@/components/game/game-context"
import { GameWorld } from "@/components/game/game-world"
import { GameUI } from "@/components/game/game-ui"
import { MainMenu } from "@/components/game/main-menu"

export default function Game() {
  const [gameStarted, setGameStarted] = useState(false)

  if (!gameStarted) {
    return <MainMenu onStart={() => setGameStarted(true)} />
  }

  return (
    <GameProvider>
      <div className="w-full h-screen relative overflow-hidden bg-black">
        <GameWorld />
        <GameUI />
      </div>
    </GameProvider>
  )
}
