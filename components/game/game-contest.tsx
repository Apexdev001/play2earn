Anumber
  maxHealth: number
  mana: number
  maxMana: number
  position: { x: number; y: number; z: number }
  stats: {
    strength: number
    agility: number
    intelligence: number
    vitality: number
  }
  skillPoints: number
  tokens: number
}

interface Item {
  id: string
  name: string
  type: "weapon" | "armor" | "consumable" | "material"
  rarity: "common" | "rare" | "epic" | "legendary"
  stats?: Record<string, number>
  price?: number
  isNFT: boolean
}

interface Quest {
  id: string
  title: string
  description: string
  objectives: string[]
  rewards: { tokens: number; experience: number; items: Item[] }
  completed: boolean
  progress: number
}

interface Guild {
  id: string
  name: string
  members: number
  level: number
  treasury: number
  territory: string[]
}

interface GameState {
  player: Player
  inventory: Item[]
  equippedItems: Record<string, Item>
  activeQuests: Quest[]
  guild: Guild | null
  marketplaceItems: Item[]
  craftingRecipes: Array<{
    id: string
    name: string
    materials: Array<{ itemId: string; quantity: number }>
    result: Item
  }>
}

type GameAction =
  | { type: "MOVE_PLAYER"; position: { x: number; y: number; z: number } }
  | { type: "GAIN_EXPERIENCE"; amount: number }
  | { type: "ADD_ITEM"; item: Item }
  | { type: "REMOVE_ITEM"; itemId: string }
  | { type: "EQUIP_ITEM"; item: Item; slot: string }
  | { type: "COMPLETE_QUEST"; questId: string }
  | { type: "JOIN_GUILD"; guild: Guild }
  | { type: "CRAFT_ITEM"; recipeId: string }

const initialState: GameState = {
  player: {
    id: "player1",
    name: "Adventurer",
    level: 1,
    experience: 0,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    position: { x: 0, y: 0, z: 0 },
    stats: { strength: 10, agility: 10, intelligence: 10, vitality: 10 },
    skillPoints: 0,
    tokens: 1000,
  },
  inventory: [
    { id: "sword1", name: "Iron Sword", type: "weapon", rarity: "common", stats: { attack: 15 }, isNFT: false },
    { id: "potion1", name: "Health Potion", type: "consumable", rarity: "common", isNFT: false },
    { id: "ore1", name: "Iron Ore", type: "material", rarity: "common", isNFT: false },
  ],
  equippedItems: {},
  activeQuests: [
    {
      id: "quest1",
      title: "Slay the Goblins",
      description: "Defeat 5 goblins in the nearby forest",
      objectives: ["Defeat goblins (0/5)"],
      rewards: { tokens: 100, experience: 250, items: [] },
      completed: false,
      progress: 0,
    },
  ],
  guild: null,
  marketplaceItems: [
    {
      id: "nft1",
      name: "Dragon Blade",
      type: "weapon",
      rarity: "legendary",
      stats: { attack: 50 },
      price: 500,
      isNFT: true,
    },
    {
      id: "nft2",
      name: "Mystic Armor",
      type: "armor",
      rarity: "epic",
      stats: { defense: 30 },
      price: 300,
      isNFT: true,
    },
  ],
  craftingRecipes: [
    {
      id: "recipe1",
      name: "Steel Sword",
      materials: [
        { itemId: "ore1", quantity: 3 },
        { itemId: "wood1", quantity: 1 },
      ],
      result: {
        id: "steel_sword",
        name: "Steel Sword",
        type: "weapon",
        rarity: "rare",
        stats: { attack: 25 },
        isNFT: false,
      },
    },
  ],
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "MOVE_PLAYER":
      return {
        ...state,
        player: { ...state.player, position: action.position },
      }
    case "GAIN_EXPERIENCE":
      const newExp = state.player.experience + action.amount
      const newLevel = Math.floor(newExp / 1000) + 1
      const leveledUp = newLevel > state.player.level

      return {
        ...state,
        player: {
          ...state.player,
          experience: newExp,
          level: newLevel,
          skillPoints: state.player.skillPoints + (leveledUp ? 1 : 0),
        },
      }
    case "ADD_ITEM":
      return {
        ...state,
        inventory: [...state.inventory, action.item],
      }
    case "EQUIP_ITEM":
      return {
        ...state,
        equippedItems: { ...state.equippedItems, [action.slot]: action.item },
      }
    default:
      return state
  }
}

const GameContext = createContext<{
  state: GameState
  dispatch: React.Dispatch<GameAction>
} | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error("useGame must be used within GameProvider")
  }
  return context
}
