// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

// ========================================
// REALM TOKEN - Main Game Currency
// ========================================

contract RealmToken is ERC20, Ownable {
    mapping(address => bool) public gameContracts;
    
    event GameContractAdded(address indexed contractAddress);
    event GameContractRemoved(address indexed contractAddress);
    
    constructor() ERC20("Realm Token", "REALM") {
        _mint(msg.sender, 100_000_000 * 10**decimals()); // 100M initial supply
    }
    
    modifier onlyGameContract() {
        require(gameContracts[msg.sender], "Not authorized game contract");
        _;
    }
    
    function addGameContract(address _contract) external onlyOwner {
        gameContracts[_contract] = true;
        emit GameContractAdded(_contract);
    }
    
    function removeGameContract(address _contract) external onlyOwner {
        gameContracts[_contract] = false;
        emit GameContractRemoved(_contract);
    }
    
    function mintReward(address to, uint256 amount) external onlyGameContract {
        _mint(to, amount);
    }
    
    function burnFromPlayer(address from, uint256 amount) external onlyGameContract {
        _burn(from, amount);
    }
}

// ========================================
// CHARACTER SYSTEM - Player Stats & Progression
// ========================================

contract Character is ERC721Enumerable, Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;
    Counters.Counter private _characterIds;
    
    RealmToken public realmToken;
    
    struct CharacterStats {
        uint256 level;
        uint256 experience;
        uint256 health;
        uint256 maxHealth;
        uint256 mana;
        uint256 maxMana;
        uint256 strength;
        uint256 intelligence;
        uint256 agility;
        uint256 vitality;
        uint256 classType; // 0: Warrior, 1: Mage, 2: Rogue, 3: Priest
        uint256 skillPoints;
        uint256 createdAt;
        bool isActive;
    }
    
    struct SkillTree {
        mapping(uint256 => uint256) skills; // skillId => level
        uint256 totalSkillsUnlocked;
    }
    
    mapping(uint256 => CharacterStats) public characters;
    mapping(uint256 => SkillTree) public skillTrees;
    mapping(address => uint256[]) public playerCharacters;
    mapping(uint256 => address) public characterToOwner;
    
    // Skill system constants
    uint256 public constant MAX_SKILLS_PER_CLASS = 20;
    uint256 public constant MAX_SKILL_LEVEL = 10;
    uint256 public constant SKILL_POINT_COST = 1;
    
    // Experience and leveling
    uint256 public constant BASE_EXP_REQUIREMENT = 1000;
    uint256 public constant EXP_MULTIPLIER = 150; // 1.5x per level
    
    event CharacterCreated(uint256 indexed characterId, address indexed owner, uint256 classType);
    event CharacterLevelUp(uint256 indexed characterId, uint256 newLevel);
    event ExperienceGained(uint256 indexed characterId, uint256 amount);
    event SkillUnlocked(uint256 indexed characterId, uint256 skillId, uint256 level);
    event StatsUpdated(uint256 indexed characterId);
    
    constructor(address _realmToken) ERC721("ChronoRealms Character", "CRC") {
        realmToken = RealmToken(_realmToken);
    }
    
    modifier onlyCharacterOwner(uint256 characterId) {
        require(ownerOf(characterId) == msg.sender, "Not character owner");
        _;
    }
    
    modifier characterExists(uint256 characterId) {
        require(_exists(characterId), "Character does not exist");
        _;
    }
    
    function createCharacter(uint256 classType) external nonReentrant whenNotPaused {
        require(classType <= 3, "Invalid class type");
        require(playerCharacters[msg.sender].length < 5, "Maximum 5 characters per player");
        
        _characterIds.increment();
        uint256 newCharacterId = _characterIds.current();
        
        _mint(msg.sender, newCharacterId);
        
        // Initialize character stats based on class
        CharacterStats memory newCharacter = CharacterStats({
            level: 1,
            experience: 0,
            health: _getBaseHealth(classType),
            maxHealth: _getBaseHealth(classType),
            mana: _getBaseMana(classType),
            maxMana: _getBaseMana(classType),
            strength: _getBaseStat(classType, 0),
            intelligence: _getBaseStat(classType, 1),
            agility: _getBaseStat(classType, 2),
            vitality: _getBaseStat(classType, 3),
            classType: classType,
            skillPoints: 3,
            createdAt: block.timestamp,
            isActive: true
        });
        
        characters[newCharacterId] = newCharacter;
        characterToOwner[newCharacterId] = msg.sender;
        playerCharacters[msg.sender].push(newCharacterId);
        
        emit CharacterCreated(newCharacterId, msg.sender, classType);
    }
    
    function gainExperience(uint256 characterId, uint256 amount) 
        external 
        characterExists(characterId)
        onlyOwner 
    {
        CharacterStats storage character = characters[characterId];
        character.experience += amount;
        
        // Check for level up
        uint256 requiredExp = getExpRequiredForLevel(character.level + 1);
        while (character.experience >= requiredExp && character.level < 100) {
            character.level++;
            character.skillPoints += 2;
            
            // Increase base stats on level up
            character.maxHealth += (character.vitality * 10);
            character.maxMana += (character.intelligence * 5);
            character.health = character.maxHealth; // Full heal on level up
            character.mana = character.maxMana;
            
            emit CharacterLevelUp(characterId, character.level);
            
            if (character.level < 100) {
                requiredExp = getExpRequiredForLevel(character.level + 1);
            }
        }
        
        emit ExperienceGained(characterId, amount);
    }
    
    function unlockSkill(uint256 characterId, uint256 skillId) 
        external 
        onlyCharacterOwner(characterId)
        characterExists(characterId)
        nonReentrant 
    {
        CharacterStats storage character = characters[characterId];
        SkillTree storage skillTree = skillTrees[characterId];
        
        require(character.skillPoints >= SKILL_POINT_COST, "Insufficient skill points");
        require(skillId < MAX_SKILLS_PER_CLASS, "Invalid skill ID");
        require(skillTree.skills[skillId] < MAX_SKILL_LEVEL, "Skill already maxed");
        require(_canUnlockSkill(characterId, skillId), "Prerequisites not met");
        
        character.skillPoints -= SKILL_POINT_COST;
        skillTree.skills[skillId]++;
        
        if (skillTree.skills[skillId] == 1) {
            skillTree.totalSkillsUnlocked++;
        }
        
        emit SkillUnlocked(characterId, skillId, skillTree.skills[skillId]);
    }
    
    function updateCharacterStats(uint256 characterId, uint256 health, uint256 mana) 
        external 
        onlyOwner 
        characterExists(characterId) 
    {
        CharacterStats storage character = characters[characterId];
        require(health <= character.maxHealth, "Health exceeds maximum");
        require(mana <= character.maxMana, "Mana exceeds maximum");
        
        character.health = health;
        character.mana = mana;
        
        emit StatsUpdated(characterId);
    }
    
    function getExpRequiredForLevel(uint256 level) public pure returns (uint256) {
        if (level <= 1) return 0;
        return BASE_EXP_REQUIREMENT * (level - 1) * EXP_MULTIPLIER / 100;
    }
    
    function getCharacter(uint256 characterId) 
        external 
        view 
        characterExists(characterId) 
        returns (CharacterStats memory) 
    {
        return characters[characterId];
    }
    
    function getSkillLevel(uint256 characterId, uint256 skillId) 
        external 
        view 
        characterExists(characterId) 
        returns (uint256) 
    {
        return skillTrees[characterId].skills[skillId];
    }
    
    function getPlayerCharacters(address player) external view returns (uint256[] memory) {
        return playerCharacters[player];
    }
    
    // Internal helper functions
    function _getBaseHealth(uint256 classType) private pure returns (uint256) {
        if (classType == 0) return 150; // Warrior
        if (classType == 1) return 80;  // Mage
        if (classType == 2) return 100; // Rogue
        return 120; // Priest
    }
    
    function _getBaseMana(uint256 classType) private pure returns (uint256) {
        if (classType == 0) return 50;  // Warrior
        if (classType == 1) return 150; // Mage
        if (classType == 2) return 80;  // Rogue
        return 130; // Priest
    }
    
    function _getBaseStat(uint256 classType, uint256 statType) private pure returns (uint256) {
        // statType: 0=Strength, 1=Intelligence, 2=Agility, 3=Vitality
        uint256[4][4] memory baseStats = [
            [15, 8, 10, 12],  // Warrior
            [8, 15, 10, 10],  // Mage
            [10, 10, 15, 8],  // Rogue
            [10, 12, 10, 15]  // Priest
        ];
        return baseStats[classType][statType];
    }
    
    function _canUnlockSkill(uint256 characterId, uint256 skillId) private view returns (bool) {
        // Implement skill tree prerequisites logic
        // For simplicity, requiring character level >= skillId
        return characters[characterId].level >= skillId + 1;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
}

// ========================================
// GAME WORLD - Land Parcels & Territories
// ========================================

contract GameWorld is ERC721Enumerable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _landIds;
    
    RealmToken public realmToken;
    
    struct LandParcel {
        uint256 x;
        uint256 y;
        uint256 zoneType; // 0: Plains, 1: Forest, 2: Mountain, 3: Desert, 4: Swamp
        uint256 resourceType; // 0: None, 1: Iron, 2: Gold, 3: Crystals, 4: Herbs
        uint256 resourceAmount;
        uint256 lastHarvested;
        uint256 buildingType; // 0: None, 1: House, 2: Shop, 3: Guild Hall, 4: Dungeon
        bool isActive;
        address guildController;
    }
    
    struct Zone {
        string name;
        uint256 totalParcels;
        uint256 controllingGuild;
        uint256 taxRate; // Basis points (100 = 1%)
        bool isPvPEnabled;
    }
    
    mapping(uint256 => LandParcel) public landParcels;
    mapping(uint256 => Zone) public zones;
    mapping(address => uint256[]) public playerLands;
    mapping(uint256 => mapping(uint256 => uint256)) public worldGrid; // x => y => landId
    
    // Constants
    uint256 public constant WORLD_SIZE = 1000;
    uint256 public constant HARVEST_COOLDOWN = 1 days;
    uint256 public constant BASE_LAND_PRICE = 100 * 10**18; // 100 REALM tokens
    
    event LandPurchased(uint256 indexed landId, address indexed owner, uint256 x, uint256 y);
    event ResourceHarvested(uint256 indexed landId, address indexed harvester, uint256 amount);
    event BuildingConstructed(uint256 indexed landId, uint256 buildingType);
    event ZoneControlChanged(uint256 indexed zoneId, address indexed newController);
    
    constructor(address _realmToken) ERC721("ChronoRealms Land", "CRL") {
        realmToken = RealmToken(_realmToken);
        _initializeZones();
    }
    
    modifier landExists(uint256 landId) {
        require(_exists(landId), "Land does not exist");
        _;
    }
    
    modifier onlyLandOwner(uint256 landId) {
        require(ownerOf(landId) == msg.sender, "Not land owner");
        _;
    }
    
    function purchaseLand(uint256 x, uint256 y) external nonReentrant {
        require(x < WORLD_SIZE && y < WORLD_SIZE, "Coordinates out of bounds");
        require(worldGrid[x][y] == 0, "Land already owned");
        
        uint256 price = getLandPrice(x, y);
        require(realmToken.balanceOf(msg.sender) >= price, "Insufficient REALM tokens");
        
        realmToken.burnFromPlayer(msg.sender, price);
        
        _landIds.increment();
        uint256 newLandId = _landIds.current();
        
        _mint(msg.sender, newLandId);
        
        // Generate land characteristics
        LandParcel memory newLand = LandParcel({
            x: x,
            y: y,
            zoneType: _generateZoneType(x, y),
            resourceType: _generateResourceType(x, y),
            resourceAmount: _generateResourceAmount(),
            lastHarvested: 0,
            buildingType: 0,
            isActive: true,
            guildController: address(0)
        });
        
        landParcels[newLandId] = newLand;
        worldGrid[x][y] = newLandId;
        playerLands[msg.sender].push(newLandId);
        
        emit LandPurchased(newLandId, msg.sender, x, y);
    }
    
    function harvestResources(uint256 landId) 
        external 
        landExists(landId)
        onlyLandOwner(landId)
        nonReentrant 
    {
        LandParcel storage land = landParcels[landId];
        require(land.resourceType > 0, "No resources on this land");
        require(
            block.timestamp >= land.lastHarvested + HARVEST_COOLDOWN,
            "Harvest cooldown not met"
        );
        
        uint256 harvestAmount = _calculateHarvestAmount(landId);
        land.lastHarvested = block.timestamp;
        
        // Mint resource tokens (simplified - in practice, you'd have separate resource tokens)
        realmToken.mintReward(msg.sender, harvestAmount);
        
        emit ResourceHarvested(landId, msg.sender, harvestAmount);
    }
    
    function constructBuilding(uint256 landId, uint256 buildingType) 
        external 
        landExists(landId)
        onlyLandOwner(landId)
        nonReentrant 
    {
        require(buildingType > 0 && buildingType <= 4, "Invalid building type");
        LandParcel storage land = landParcels[landId];
        require(land.buildingType == 0, "Building already exists");
        
        uint256 buildingCost = _getBuildingCost(buildingType);
        require(realmToken.balanceOf(msg.sender) >= buildingCost, "Insufficient tokens");
        
        realmToken.burnFromPlayer(msg.sender, buildingCost);
        land.buildingType = buildingType;
        
        emit BuildingConstructed(landId, buildingType);
    }
    
    function getLandPrice(uint256 x, uint256 y) public pure returns (uint256) {
        // Price increases near center of world
        uint256 centerX = WORLD_SIZE / 2;
        uint256 centerY = WORLD_SIZE / 2;
        uint256 distance = _calculateDistance(x, y, centerX, centerY);
        
        // Base price increases as you get closer to center
        uint256 multiplier = (WORLD_SIZE - distance) * 100 / WORLD_SIZE + 50;
        return BASE_LAND_PRICE * multiplier / 100;
    }
    
    function getLandInfo(uint256 landId) 
        external 
        view 
        landExists(landId) 
        returns (LandParcel memory) 
    {
        return landParcels[landId];
    }
    
    function getPlayerLands(address player) external view returns (uint256[] memory) {
        return playerLands[player];
    }
    
    function getLandAtCoordinate(uint256 x, uint256 y) external view returns (uint256) {
        return worldGrid[x][y];
    }
    
    // Internal functions
    function _generateZoneType(uint256 x, uint256 y) private pure returns (uint256) {
        uint256 hash = uint256(keccak256(abi.encodePacked(x, y, "zone")));
        return hash % 5;
    }
    
    function _generateResourceType(uint256 x, uint256 y) private pure returns (uint256) {
        uint256 hash = uint256(keccak256(abi.encodePacked(x, y, "resource")));
        if (hash % 100 < 60) return 0; // 60% chance of no resources
        return (hash % 4) + 1;
    }
    
    function _generateResourceAmount() private view returns (uint256) {
        uint256 hash = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty)));
        return (hash % 1000) + 100; // 100-1099 resources
    }
    
    function _calculateHarvestAmount(uint256 landId) private view returns (uint256) {
        LandParcel storage land = landParcels[landId];
        uint256 baseAmount = land.resourceAmount / 10; // 10% of total resources per harvest
        
        // Bonus based on building type
        if (land.buildingType == 2) baseAmount = baseAmount * 120 / 100; // 20% bonus for shop
        
        return baseAmount;
    }
    
    function _getBuildingCost(uint256 buildingType) private pure returns (uint256) {
        uint256[5] memory costs = [0, 500, 1000, 2000, 1500]; // [None, House, Shop, Guild Hall, Dungeon]
        return costs[buildingType] * 10**18;
    }
    
    function _calculateDistance(uint256 x1, uint256 y1, uint256 x2, uint256 y2) 
        private 
        pure 
        returns (uint256) 
    {
        uint256 dx = x1 > x2 ? x1 - x2 : x2 - x1;
        uint256 dy = y1 > y2 ? y1 - y2 : y2 - y1;
        return dx + dy; // Manhattan distance
    }
    
    function _initializeZones() private {
        // Initialize default zones
        zones[1] = Zone("Peaceful Plains", 0, 0, 0, false);
        zones[2] = Zone("Dark Forest", 0, 0, 100, true);
        zones[3] = Zone("Crystal Mountains", 0, 0, 200, true);
        zones[4] = Zone("Burning Desert", 0, 0, 150, true);
        zones[5] = Zone("Mystic Swamplands", 0, 0, 300, true);
    }
}

// ========================================
// ITEM NFT SYSTEM - Equipment & Crafting
// ========================================

contract ItemNFT is ERC721Enumerable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    
    RealmToken public realmToken;
    
    enum ItemType { Weapon, Armor, Accessory, Consumable, Material, Special }
    enum Rarity { Common, Uncommon, Rare, Epic, Legendary, Mythic }
    
    struct Item {
        ItemType itemType;
        Rarity rarity;
        uint256 level;
        uint256 attack;
        uint256 defense;
        uint256 durability;
        uint256 maxDurability;
        uint256 enchantment;
        uint256 createdAt;
        string name;
        bool isEquipped;
        uint256 equippedToCharacter;
    }
    
    struct CraftingRecipe {
        mapping(uint256 => uint256) materials; // itemId => amount required
        uint256 craftingCost;
        uint256 successRate; // Out of 10000 (100.00%)
        bool isActive;
    }
    
    mapping(uint256 => Item) public items;
    mapping(uint256 => CraftingRecipe) public craftingRecipes;
    mapping(address => uint256[]) public playerItems;
    mapping(uint256 => bool) public equipableItems;
    
    // Marketplace
    struct MarketListing {
        uint256 itemId;
        address seller;
        uint256 price;
        bool isActive;
        uint256 listedAt;
    }
    
    mapping(uint256 => MarketListing) public marketListings;
    uint256[] public activeListings;
    uint256 public marketplaceFee = 250; // 2.5%
    
    event ItemCrafted(uint256 indexed itemId, address indexed crafter, uint256 recipeId);
    event ItemEnchanted(uint256 indexed itemId, uint256 newEnchantmentLevel);
    event ItemListed(uint256 indexed itemId, address indexed seller, uint256 price);
    event ItemSold(uint256 indexed itemId, address indexed seller, address indexed buyer, uint256 price);
    event ItemEquipped(uint256 indexed itemId, uint256 indexed characterId);
    event ItemUnequipped(uint256 indexed itemId, uint256 indexed characterId);
    
    constructor(address _realmToken) ERC721("ChronoRealms Items", "CRI") {
        realmToken = RealmToken(_realmToken);
        _initializeCraftingRecipes();
    }
    
    modifier itemExists(uint256 itemId) {
        require(_exists(itemId), "Item does not exist");
        _;
    }
    
    modifier onlyItemOwner(uint256 itemId) {
        require(ownerOf(itemId) == msg.sender, "Not item owner");
        _;
    }
    
    function craftItem(uint256 recipeId, uint256[] calldata materialIds, uint256[] calldata amounts) 
        external 
        nonReentrant 
    {
        CraftingRecipe storage recipe = craftingRecipes[recipeId];
        require(recipe.isActive, "Recipe not active");
        require(materialIds.length == amounts.length, "Array length mismatch");
        
        // Check materials and burn them
        for (uint256 i = 0; i < materialIds.length; i++) {
            require(ownerOf(materialIds[i]) == msg.sender, "Don't own required material");
            require(recipe.materials[materialIds[i]] == amounts[i], "Wrong material amount");
            _burn(materialIds[i]);
        }
        
        // Pay crafting cost
        require(realmToken.balanceOf(msg.sender) >= recipe.craftingCost, "Insufficient tokens");
        realmToken.burnFromPlayer(msg.sender, recipe.craftingCost);
        
        // Roll for success
        uint256 roll = _random() % 10000;
        require(roll < recipe.successRate, "Crafting failed");
        
        // Mint new item
        _itemIds.increment();
        uint256 newItemId = _itemIds.current();
        _mint(msg.sender, newItemId);
        
        // Generate item stats
        Item memory newItem = _generateCraftedItem(recipeId);
        items[newItemId] = newItem;
        playerItems[msg.sender].push(newItemId);
        
        emit ItemCrafted(newItemId, msg.sender, recipeId);
    }
    
    function enchantItem(uint256 itemId) 
        external 
        itemExists(itemId)
        onlyItemOwner(itemId)
        nonReentrant 
    {
        Item storage item = items[itemId];
        require(item.enchantment < 10, "Max enchantment reached");
        
        uint256 enchantCost = _getEnchantmentCost(item.enchantment + 1);
        require(realmToken.balanceOf(msg.sender) >= enchantCost, "Insufficient tokens");
        
        realmToken.burnFromPlayer(msg.sender, enchantCost);
        
        // Enchantment success rate decreases with level
        uint256 successRate = 9000 - (item.enchantment * 1000); // 90% to 10%
        uint256 roll = _random() % 10000;
        
        if (roll < successRate) {
            item.enchantment++;
            item.attack = item.attack * 110 / 100; // 10% attack boost
            item.defense = item.defense * 110 / 100; // 10% defense boost
            
            emit ItemEnchanted(itemId, item.enchantment);
        }
        // No else clause - enchantment can fail and player loses tokens
    }
    
    function listItemForSale(uint256 itemId, uint256 price) 
        external 
        itemExists(itemId)
        onlyItemOwner(itemId)
    {
        require(price > 0, "Price must be greater than 0");
        require(!items[itemId].isEquipped, "Cannot sell equipped item");
        
        marketListings[itemId] = MarketListing({
            itemId: itemId,
            seller: msg.sender,
            price: price,
            isActive: true,
            listedAt: block.timestamp
        });
        
        activeListings.push(itemId);
        
        emit ItemListed(itemId, msg.sender, price);
    }
    
    function buyItem(uint256 itemId) external itemExists(itemId) nonReentrant {
        MarketListing storage listing = marketListings[itemId];
        require(listing.isActive, "Item not for sale");
        require(listing.seller != msg.sender, "Cannot buy own item");
        require(realmToken.balanceOf(msg.sender) >= listing.price, "Insufficient tokens");
        
        address seller = listing.seller;
        uint256 price = listing.price;
        
        // Calculate fees
        uint256 fee = price * marketplaceFee / 10000;
        uint256 sellerAmount = price - fee;
        
        // Transfer tokens
        realmToken.transferFrom(msg.sender, seller, sellerAmount);
        realmToken.burnFromPlayer(msg.sender, fee); // Burn marketplace fee
        
        // Transfer NFT
        _transfer(seller, msg.sender, itemId);
        
        // Update player items arrays
        _removeFromPlayerItems(seller, itemId);
        playerItems[msg.sender].push(itemId);
        
        // Clear listing
        listing.isActive = false;
        _removeFromActiveListings(itemId);
        
        emit ItemSold(itemId, seller, msg.sender, price);
    }
    
    function equipItem(uint256 itemId, uint256 characterId) 
        external 
        itemExists(itemId)
        onlyItemOwner(itemId) 
    {
        Item storage item = items[itemId];
        require(!item.isEquipped, "Item already equipped");
        require(equipableItems[uint256(item.itemType)], "Item not equipable");
        
        // TODO: Add character ownership check here
        
        item.isEquipped = true;
        item.equippedToCharacter = characterId;
        
        emit ItemEquipped(itemId, characterId);
    }
    
    function unequipItem(uint256 itemId) 
        external 
        itemExists(itemId)
        onlyItemOwner(itemId) 
    {
        Item storage item = items[itemId];
        require(item.isEquipped, "Item not equipped");
        
        uint256 characterId = item.equippedToCharacter;
        item.isEquipped = false;
        item.equippedToCharacter = 0;
        
        emit ItemUnequipped(itemId, characterId);
    }
    
    function getItem(uint256 itemId) 
        external 
        view 
        itemExists(itemId) 
        returns (Item memory) 
    {
        return items[itemId];
    }
    
    function getPlayerItems(address player) external view returns (uint256[] memory) {
        return playerItems[player];
    }
    
    function getActiveMarketListings() external view returns (uint256[] memory) {
        return activeListings;
    }
    
    // Internal functions
   function _generateCraftedItem(uint256 recipeId) private view returns (Item memory) {
    // Simplified item generation - in practice, recipes would determine item properties
    uint256 randomness = _random();

    return Item({
        itemType: ItemType(randomness % 6),
        rarity: Rarity(randomness % 6),
        level: 1,
        attack: randomness % 100,
        defense: randomness % 100,
        durability: 100,
        maxDurability: 100,
        enchantment: 0,
        createdAt: block.timestamp,
        name: "Crafted Item",
        isEquipped: false,
        equippedToCharacter: 0
    });
}