"use client"

import { useGame } from "./game-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Coins, Star } from "lucide-react"

export function QuestPanel() {
  const { state, dispatch } = useGame()

  const handleCompleteQuest = (questId: string) => {
    dispatch({ type: "COMPLETE_QUEST", questId })
  }

  return (
    <div className="text-white space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Active Quests</h2>
        <Badge variant="secondary">{state.activeQuests.length} Active</Badge>
      </div>

      {state.activeQuests.map((quest) => (
        <Card key={quest.id} className="p-4 bg-gray-800 border-gray-600">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-bold text-lg">{quest.title}</h3>
              <p className="text-gray-400 text-sm">{quest.description}</p>
            </div>
            <Badge variant={quest.completed ? "default" : "secondary"}>
              {quest.completed ? "Complete" : "In Progress"}
            </Badge>
          </div>

          <div className="space-y-2 mb-4">
            {quest.objectives.map((objective, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${quest.progress > index ? "bg-green-500" : "bg-gray-500"}`} />
                <span className="text-sm">{objective}</span>
              </div>
            ))}
          </div>

          <Progress value={quest.progress * 20} className="mb-4" />

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span>{quest.rewards.tokens}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-blue-500" />
                <span>{quest.rewards.experience} EXP</span>
              </div>
            </div>

            {quest.completed && (
              <Button size="sm" onClick={() => handleCompleteQuest(quest.id)}>
                Claim Rewards
              </Button>
            )}
          </div>
        </Card>
      ))}

      <Card className="p-4 bg-gray-800 border-gray-600">
        <h3 className="font-bold mb-2">Daily Quests</h3>
        <p className="text-gray-400 text-sm mb-4">Complete daily challenges for bonus rewards!</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span>Defeat 10 monsters</span>
            <Badge variant="outline">3/10</Badge>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Craft 5 items</span>
            <Badge variant="outline">0/5</Badge>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Trade with other players</span>
            <Badge variant="outline">1/3</Badge>
          </div>
        </div>
      </Card>
    </div>
  )
}
