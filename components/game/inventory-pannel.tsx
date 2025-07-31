"use client"

import { useState } from "react"
import { useGame } from "./game-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function InventoryPanel() {
  const { state, dispatch } = useGame()
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-500"
      case "rare":
        return "bg-blue-500"
      case "epic":
        return "bg-purple-500"
      case "legendary":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleEquipItem = (item: any) => {
    if (item.type === "weapon") {
      dispatch({ type: "EQUIP_ITEM", item, slot: "weapon" })
    } else if (item.type === "armor") {
      dispatch({ type: "EQUIP_ITEM", item, slot: "armor" })
    }
  }

  return (
    <div className="text-white">
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-6 gap-2">
            {state.inventory.map((item) => (
              <Card
                key={item.id}
                className={`p-2 cursor-pointer hover:bg-gray-700 transition-colors ${
                  selectedItem === item.id ? "ring-2 ring-blue-500" : ""
                } ${getRarityColor(item.rarity)} bg-opacity-20`}
                onClick={() => setSelectedItem(item.id)}
              >
                <div className="aspect-square bg-gray-600 rounded mb-2 flex items-center justify-center">
                  <span className="text-2xl">
                    {item.type === "weapon"
                      ? "⚔️"
                      : item.type === "armor"
                        ? "🛡️"
                        : item.type === "consumable"
                          ? "🧪"
                          : "📦"}
                  </span>
                </div>
                <div className="text-xs text-center">
                  <div className="font-medium truncate">{item.name}</div>
                  <Badge variant="secondary" className={`text-xs ${getRarityColor(item.rarity)}`}>
                    {item.rarity}
                  </Badge>
                  {item.isNFT && (
                    <Badge variant="outline" className="text-xs mt-1">
                      NFT
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {selectedItem && (
            <Card className="p-4 bg-gray-800">
              {(() => {
                const item = state.inventory.find((i) => i.id === selectedItem)
                if (!item) return null

                return (
                  <div>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <Badge className={getRarityColor(item.rarity)}>{item.rarity}</Badge>
                    {item.isNFT && (
                      <Badge variant="outline" className="ml-2">
                        NFT
                      </Badge>
                    )}

                    {item.stats && (
                      <div className="mt-2">
                        <h4 className="font-medium">Stats:</h4>
                        {Object.entries(item.stats).map(([stat, value]) => (
                          <div key={stat} className="text-sm">
                            {stat}: +{value}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      {(item.type === "weapon" || item.type === "armor") && (
                        <Button size="sm" onClick={() => handleEquipItem(item)}>
                          Equip
                        </Button>
                      )}
                      {item.type === "consumable" && (
                        <Button size="sm" variant="secondary">
                          Use
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })()}
            </Card>
          )}
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 bg-gray-800">
              <h3 className="font-medium mb-2">Weapon</h3>
              {state.equippedItems.weapon ? (
                <div className="text-center">
                  <div className="text-2xl mb-2">⚔️</div>
                  <div className="text-sm">{state.equippedItems.weapon.name}</div>
                </div>
              ) : (
                <div className="text-center text-gray-500">Empty</div>
              )}
            </Card>

            <Card className="p-4 bg-gray-800">
              <h3 className="font-medium mb-2">Armor</h3>
              {state.equippedItems.armor ? (
                <div className="text-center">
                  <div className="text-2xl mb-2">🛡️</div>
                  <div className="text-sm">{state.equippedItems.armor.name}</div>
                </div>
              ) : (
                <div className="text-center text-gray-500">Empty</div>
              )}
            </Card>

            <Card className="p-4 bg-gray-800">
              <h3 className="font-medium mb-2">Accessory</h3>
              <div className="text-center text-gray-500">Empty</div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
