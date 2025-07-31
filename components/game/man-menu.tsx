"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Settings, Trophy, Users, Coins } from "lucide-react"

interface MainMenuProps {
  onStart: () => void
}

export function MainMenu({ onStart }: MainMenuProps) {
  const [showNews, setShowNews] = useState(true)

  return (
    <div className="w-full h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-indigo-500 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            CRYPTOQUEST
          </h1>
          <p className="text-xl text-gray-300 mb-2">Play • Earn • Own • Conquer</p>
          <p className="text-gray-400">The Ultimate Blockchain Adventure RPG</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Menu */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-black/40 backdrop-blur-lg border-gray-600">
              <div className="space-y-4">
                <Button
                  size="lg"
                  className="w-full text-lg py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  onClick={onStart}
                >
                  <Play className="w-6 h-6 mr-2" />
                  Enter the World
                </Button>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" size="lg" className="py-4 bg-transparent">
                    <Trophy className="w-5 h-5 mr-2" />
                    Leaderboards
                  </Button>
                  <Button variant="outline" size="lg" className="py-4 bg-transparent">
                    <Users className="w-5 h-5 mr-2" />
                    Guilds
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="secondary" size="lg" className="py-4">
                    <Settings className="w-5 h-5 mr-2" />
                    Settings
                  </Button>
                  <Button variant="secondary" size="lg" className="py-4">
                    <Coins className="w-5 h-5 mr-2" />
                    Marketplace
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* News & Updates */}
          <div className="space-y-6">
            <Card className="p-6 bg-black/40 backdrop-blur-lg border-gray-600">
              <h3 className="text-xl font-bold text-white mb-4">Latest News</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-purple-500 pl-4">
                  <Badge variant="secondary" className="mb-2">
                    New Event
                  </Badge>
                  <h4 className="font-medium text-white">Dragon Festival</h4>
                  <p className="text-sm text-gray-400">Exclusive NFT rewards available for limited time!</p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <Badge variant="secondary" className="mb-2">
                    Update
                  </Badge>
                  <h4 className="font-medium text-white">Guild Wars 2.0</h4>
                  <p className="text-sm text-gray-400">Enhanced PvP mechanics and territory control.</p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <Badge variant="secondary" className="mb-2">
                    Economy
                  </Badge>
                  <h4 className="font-medium text-white">Token Staking</h4>
                  <p className="text-sm text-gray-400">Earn passive rewards by staking your tokens.</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-black/40 backdrop-blur-lg border-gray-600">
              <h3 className="text-xl font-bold text-white mb-4">Game Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Players</span>
                  <span className="text-white font-medium">12,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">NFTs Minted</span>
                  <span className="text-white font-medium">45,231</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Guilds</span>
                  <span className="text-white font-medium">1,203</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tokens Earned</span>
                  <span className="text-white font-medium">2.4M</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">Connect your wallet to start earning • Built on Ethereum & Polygon</p>
        </div>
      </div>
    </div>
  )
}
