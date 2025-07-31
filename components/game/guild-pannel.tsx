"use client"

import { useState } from "react"
import { useGame } from "./game-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Crown, Coins, Swords, Trophy } from "lucide-react"

export function GuildPanel() {
  const { state } = useGame()
  const [selectedGuild, setSelectedGuild] = useState<string | null>(null)

  const availableGuilds = [
    {
      id: "guild1",
      name: "Dragon Slayers",
      members: 45,
      level: 12,
      treasury: 15000,
      territory: ["Forest Keep", "Mountain Pass"],
    },
    { id: "guild2", name: "Mystic Order", members: 38, level: 10, treasury: 12000, territory: ["Crystal Caves"] },
    {
      id: "guild3",
      name: "Iron Brotherhood",
      members: 52,
      level: 15,
      treasury: 20000,
      territory: ["Steel Fortress", "Iron Mines", "Battle Arena"],
    },
  ]

  if (state.guild) {
    return (
      <div className="text-white">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="wars">Guild Wars</TabsTrigger>
            <TabsTrigger value="treasury">Treasury</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="p-4 bg-gray-800 border-gray-600">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{state.guild.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>Level {state.guild.level}</span>
                    <span>{state.guild.members} members</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Guild Experience</h3>
                  <Progress value={75} className="mb-1" />
                  <div className="text-xs text-gray-400">7,500 / 10,000 EXP</div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Territory Control</h3>
                  <div className="space-y-1">
                    {state.guild.territory.map((territory) => (
                      <Badge key={territory} variant="secondary" className="mr-1">
                        {territory}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gray-800 border-gray-600">
              <h3 className="font-bold mb-3">Recent Activities</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Conquered Crystal Caves</span>
                  <span className="text-green-500">+500 EXP</span>
                </div>
                <div className="flex justify-between">
                  <span>Member reached Level 50</span>
                  <span className="text-blue-500">+100 EXP</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed Guild Quest</span>
                  <span className="text-yellow-500">+1000 Tokens</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card className="p-4 bg-gray-800 border-gray-600">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Guild Members ({state.guild.members})</h3>
                <Button size="sm">Invite Player</Button>
              </div>

              <div className="space-y-2">
                {["GuildMaster", "Officer", "Veteran", "Member", "Recruit"].map((rank, index) => (
                  <div key={rank} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm">
                        {rank[0]}
                      </div>
                      <div>
                        <div className="font-medium">Player{index + 1}</div>
                        <div className="text-xs text-gray-400">
                          {rank} • Level {50 - index * 5}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">Online</div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="wars" className="space-y-4">
            <Card className="p-4 bg-gray-800 border-gray-600">
              <div className="flex items-center gap-2 mb-4">
                <Swords className="w-5 h-5 text-red-500" />
                <h3 className="font-bold">Active Guild Wars</h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">vs Shadow Legion</span>
                    <Badge variant="destructive">Active</Badge>
                  </div>
                  <div className="text-sm text-gray-400 mb-2">Battle for Iron Mines</div>
                  <Progress value={65} className="mb-2" />
                  <div className="flex justify-between text-xs">
                    <span>Victory Progress: 65%</span>
                    <span>Ends in 2d 14h</span>
                  </div>
                </div>

                <div className="p-3 bg-gray-700 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">vs Storm Raiders</span>
                    <Badge variant="secondary">Scheduled</Badge>
                  </div>
                  <div className="text-sm text-gray-400">Starts in 1d 8h</div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="treasury" className="space-y-4">
            <Card className="p-4 bg-gray-800 border-gray-600">
              <div className="flex items-center gap-2 mb-4">
                <Coins className="w-5 h-5 text-yellow-500" />
                <h3 className="font-bold">Guild Treasury</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">{state.guild.treasury}</div>
                  <div className="text-sm text-gray-400">Total Tokens</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">+2,500</div>
                  <div className="text-sm text-gray-400">Weekly Income</div>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full" variant="secondary">
                  Contribute Tokens
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  Request Funding
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="text-white space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Join a Guild</h2>
        <p className="text-gray-400">Team up with other players for greater adventures and rewards!</p>
      </div>

      <div className="space-y-3">
        {availableGuilds.map((guild) => (
          <Card key={guild.id} className="p-4 bg-gray-800 border-gray-600 hover:bg-gray-700 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{guild.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{guild.members} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      <span>Level {guild.level}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span>{guild.treasury.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm text-gray-400 mb-1">Controlled Territory:</div>
                    <div className="flex gap-1">
                      {guild.territory.map((territory) => (
                        <Badge key={territory} variant="secondary" className="text-xs">
                          {territory}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  View Details
                </Button>
                <Button size="sm">Join Guild</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-gray-800 border-gray-600">
        <h3 className="font-bold mb-2">Create Your Own Guild</h3>
        <p className="text-gray-400 text-sm mb-4">
          Start your own guild and lead other players to victory! Requires 1000 tokens.
        </p>
        <Button className="w-full" disabled={state.player.tokens < 1000}>
          Create Guild (1000 tokens)
        </Button>
      </Card>
    </div>
  )
}
