"use client"

import { useState } from "react"
import { useGame } from "./game-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, TrendingUp, Coins } from "lucide-react"

export function MarketplacePanel() {
  const { state, dispatch } = useGame()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

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

  const handlePurchase = (item: any) => {
    if (state.player.tokens >= (item.price || 0)) {
      dispatch({ type: "ADD_ITEM", item })
      // In a real implementation, this would deduct tokens
      console.log(`Purchased ${item.name} for ${item.price} tokens`)
    }
  }

  const filteredItems = state.marketplaceItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "all" || item.type === selectedCategory),
  )

  return (
    <div className="text-white">
      <Tabs defaultValue="buy" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="buy">Buy</TabsTrigger>
          <TabsTrigger value="sell">Sell</TabsTrigger>
          <TabsTrigger value="auction">Auctions</TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2"
            >
              <option value="all">All Categories</option>
              <option value="weapon">Weapons</option>
              <option value="armor">Armor</option>
              <option value="consumable">Consumables</option>
              <option value="material">Materials</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="p-4 bg-gray-800 border-gray-600">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">
                    {item.type === "weapon"
                      ? "⚔️"
                      : item.type === "armor"
                        ? "🛡️"
                        : item.type === "consumable"
                          ? "🧪"
                          : "📦"}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold">{item.name}</h3>
                      <Badge className={getRarityColor(item.rarity)}>{item.rarity}</Badge>
                      {item.isNFT && <Badge variant="outline">NFT</Badge>}
                    </div>

                    {item.stats && (
                      <div className="text-sm text-gray-400 mb-2">
                        {Object.entries(item.stats).map(([stat, value]) => (
                          <div key={stat}>
                            {stat}: +{value}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold">{item.price}</span>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handlePurchase(item)}
                        disabled={state.player.tokens < (item.price || 0)}
                      >
                        Buy
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sell" className="space-y-4">
          <Card className="p-4 bg-gray-800 border-gray-600">
            <h3 className="font-bold mb-4">Sell Your Items</h3>
            <div className="grid grid-cols-3 gap-2">
              {state.inventory.map((item) => (
                <Card key={item.id} className="p-2 cursor-pointer hover:bg-gray-700">
                  <div className="text-center">
                    <div className="text-2xl mb-1">
                      {item.type === "weapon"
                        ? "⚔️"
                        : item.type === "armor"
                          ? "🛡️"
                          : item.type === "consumable"
                            ? "🧪"
                            : "📦"}
                    </div>
                    <div className="text-xs">{item.name}</div>
                    <Button size="sm" className="mt-2 w-full">
                      List
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="auction" className="space-y-4">
          <Card className="p-4 bg-gray-800 border-gray-600">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="font-bold">Live Auctions</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                <div>
                  <span className="font-medium">Legendary Dragon Sword</span>
                  <div className="text-sm text-gray-400">Ends in 2h 15m</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-yellow-500">1,250 tokens</div>
                  <Button size="sm" className="mt-1">
                    Bid
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                <div>
                  <span className="font-medium">Epic Mage Robes</span>
                  <div className="text-sm text-gray-400">Ends in 45m</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-yellow-500">800 tokens</div>
                  <Button size="sm" className="mt-1">
                    Bid
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
