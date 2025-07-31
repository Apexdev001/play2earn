"use client"

import { useState } from "react"
import { useGame } from "./game-context"
import { InventoryPanel } from "./inventory-panel"
import { QuestPanel } from "./quest-panel"
import { MarketplacePanel } from "./marketplace-panel"
import { GuildPanel } from "./guild-panel"
import { CraftingPanel } from "./crafting-panel"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Backpack, Scroll, Store, Users, Hammer, Heart, Zap, Coins } from "lucide-react"

export function GameUI() {
  const { state } = useGame()
  const [activePanel, setActivePanel] = useState<string | null>(null)

  const panels = [
    { id: "inventory", icon: Backpack, label: "Inventory" },
    { id: "quests", icon: Scroll, label: "Quests" },
    { id: "marketplace", icon: Store, label: "Marketplace" },
    { id: "guild", icon: Users, label: "Guild" },
    { id: "crafting", icon: Hammer, label: "Crafting" },
  ]

  return (
    <>
      {/* Player Stats HUD */}
      <Card className="absolute top-4 left-4 p-4 bg-black/80 text-white border-gray-600">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-bold">{state.player.name}</span>
            <Badge variant="secondary">Lv.{state.player.level}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            <Progress value={(state.player.health / state.player.maxHealth) * 100} className="w-24 h-2" />
            <span className="text-xs">
              {state.player.health}/{state.player.maxHealth}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <Progress value={(state.player.mana / state.player.maxMana) * 100} className="w-24 h-2" />
            <span className="text-xs">
              {state.player.mana}/{state.player.maxMana}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">{state.player.tokens}</span>
          </div>

          <div className="text-xs text-gray-400">
            EXP: {state.player.experience} / {state.player.level * 1000}
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        {panels.map((panel) => (
          <Button
            key={panel.id}
            variant={activePanel === panel.id ? "default" : "secondary"}
            size="sm"
            onClick={() => setActivePanel(activePanel === panel.id ? null : panel.id)}
            className="flex items-center gap-2"
          >
            <panel.icon className="w-4 h-4" />
            {panel.label}
          </Button>
        ))}
      </div>

      {/* Mini Map */}
      <Card className="absolute top-4 right-4 w-48 h-48 bg-black/80 border-gray-600">
        <div className="w-full h-full relative bg-green-900/50 rounded">
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-red-500 rounded transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-yellow-500 rounded transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </Card>

      {/* Active Panel */}
      {activePanel && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white capitalize">{activePanel}</h2>
              <Button variant="ghost" onClick={() => setActivePanel(null)}>
                ✕
              </Button>
            </div>

            {activePanel === "inventory" && <InventoryPanel />}
            {activePanel === "quests" && <QuestPanel />}
            {activePanel === "marketplace" && <MarketplacePanel />}
            {activePanel === "guild" && <GuildPanel />}
            {activePanel === "crafting" && <CraftingPanel />}
          </div>
        </div>
      )}
    </>
  )
}
