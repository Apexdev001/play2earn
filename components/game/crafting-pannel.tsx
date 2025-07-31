"use client"

import { useState } from "react"
import { useGame } from "./game-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Hammer, Zap, Beaker, Gem } from "lucide-react"

export function CraftingPanel() {
  const { state, dispatch } = useGame()
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null)
  const [craftingProgress, setCraftingProgress] = useState(0)
  const [isCrafting, setIsCrafting] = useState(false)

  const craftingCategories = [
    { id: "weapons", name: "Weapons", icon: Hammer, color: "text-red-500" },
    { id: "armor", name: "Armor", icon: Zap, color: "text-blue-500" },
    { id: "consumables", name: "Consumables", icon: Beaker, color: "text-green-500" },
    { id: "enchanting", name: "Enchanting", icon: Gem, color: "text-purple-500" },
  ]

  const recipes = {
    weapons: [
      {
        id: "steel_sword",
        name: "Steel Sword",
        materials: [
          { name: "Iron Ore", quantity: 3, available: 1 },
          { name: "Coal", quantity: 2, available: 0 },
          { name: "Wood", quantity: 1, available: 2 },
        ],
        result: { name: "Steel Sword", rarity: "rare", stats: { attack: 25 } },
        craftTime: 300,
        experience: 150,
      },
      {
        id: "flame_blade",
        name: "Flame Blade",
        materials: [
          { name: "Steel Sword", quantity: 1, available: 0 },
          { name: "Fire Crystal", quantity: 2, available: 1 },
          { name: "Dragon Scale", quantity: 1, available: 0 },
        ],
        result: { name: "Flame Blade", rarity: "epic", stats: { attack: 40, fire: 15 } },
        craftTime: 600,
        experience: 300,
      },
    ],
    armor: [
      {
        id: "leather_armor",
        name: "Leather Armor",
        materials: [
          { name: "Leather", quantity: 5, available: 3 },
          { name: "Thread", quantity: 3, available: 5 },
        ],
        result: { name: "Leather Armor", rarity: "common", stats: { defense: 15 } },
        craftTime: 180,
        experience: 75,
      },
    ],
    consumables: [
      {
        id: "health_potion",
        name: "Health Potion",
        materials: [
          { name: "Red Herb", quantity: 2, available: 4 },
          { name: "Water", quantity: 1, available: 10 },
        ],
        result: { name: "Health Potion", rarity: "common", effect: "Restore 50 HP" },
        craftTime: 60,
        experience: 25,
      },
    ],
    enchanting: [
      {
        id: "weapon_enchant",
        name: "Weapon Enchantment",
        materials: [
          { name: "Magic Crystal", quantity: 1, available: 0 },
          { name: "Enchant Scroll", quantity: 1, available: 1 },
        ],
        result: { name: "Weapon Enchantment", rarity: "rare", effect: "+10 Attack" },
        craftTime: 240,
        experience: 200,
      },
    ],
  }

  const handleCraft = (recipe: any) => {
    const canCraft = recipe.materials.every((mat: any) => mat.available >= mat.quantity)

    if (canCraft && !isCrafting) {
      setIsCrafting(true)
      setCraftingProgress(0)

      const interval = setInterval(() => {
        setCraftingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsCrafting(false)
            dispatch({ type: "GAIN_EXPERIENCE", amount: recipe.experience })
            // In a real implementation, would add the crafted item and remove materials
            return 0
          }
          return prev + 100 / (recipe.craftTime / 100)
        })
      }, 100)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-400"
      case "rare":
        return "text-blue-400"
      case "epic":
        return "text-purple-400"
      case "legendary":
        return "text-orange-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <div className="text-white">
      <Tabs defaultValue="weapons" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {craftingCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
              <category.icon className={`w-4 h-4 ${category.color}`} />
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {craftingCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {recipes[category.id as keyof typeof recipes]?.map((recipe) => {
                const canCraft = recipe.materials.every((mat) => mat.available >= mat.quantity)

                return (
                  <Card key={recipe.id} className="p-4 bg-gray-800 border-gray-600">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{recipe.name}</h3>
                        <Badge className={getRarityColor(recipe.result.rarity)}>{recipe.result.rarity}</Badge>
                        <div className="text-sm text-gray-400 mt-1">
                          Craft Time: {Math.floor(recipe.craftTime / 60)}m {recipe.craftTime % 60}s
                        </div>
                        <div className="text-sm text-blue-400">Experience: +{recipe.experience}</div>
                      </div>

                      <div className="text-right">
                        {recipe.result.stats && (
                          <div className="text-sm">
                            {Object.entries(recipe.result.stats).map(([stat, value]) => (
                              <div key={stat} className="text-green-400">
                                {stat}: +{value}
                              </div>
                            ))}
                          </div>
                        )}
                        {recipe.result.effect && <div className="text-sm text-yellow-400">{recipe.result.effect}</div>}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Required Materials:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {recipe.materials.map((material, index) => (
                          <div
                            key={index}
                            className={`flex justify-between items-center p-2 rounded ${
                              material.available >= material.quantity
                                ? "bg-green-900/30 border border-green-500/30"
                                : "bg-red-900/30 border border-red-500/30"
                            }`}
                          >
                            <span className="text-sm">{material.name}</span>
                            <span
                              className={`text-sm ${
                                material.available >= material.quantity ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {material.available}/{material.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {isCrafting && selectedRecipe === recipe.id && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Crafting Progress</span>
                          <span className="text-sm">{Math.floor(craftingProgress)}%</span>
                        </div>
                        <Progress value={craftingProgress} />
                      </div>
                    )}

                    <Button
                      className="w-full"
                      disabled={!canCraft || isCrafting}
                      onClick={() => {
                        setSelectedRecipe(recipe.id)
                        handleCraft(recipe)
                      }}
                    >
                      {isCrafting && selectedRecipe === recipe.id ? "Crafting..." : "Craft Item"}
                    </Button>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="p-4 bg-gray-800 border-gray-600 mt-4">
        <h3 className="font-bold mb-2">Crafting Skills</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Weaponsmithing</span>
            <div className="flex items-center gap-2">
              <Progress value={65} className="w-24" />
              <span className="text-sm">Level 6</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Armorsmithing</span>
            <div className="flex items-center gap-2">
              <Progress value={40} className="w-24" />
              <span className="text-sm">Level 4</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Alchemy</span>
            <div className="flex items-center gap-2">
              <Progress value={80} className="w-24" />
              <span className="text-sm">Level 8</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
