// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Character {
    struct Stats {
        uint256 xp;
        uint8 level;
        uint8 strength;
        uint8 agility;
        uint8 intelligence;
        string classType;
    }

    mapping(address => Stats) public characters;

    event CharacterCreated(address indexed player, string classType);
    event StatsUpdated(address indexed player, uint256 xp, uint8 level);

    function createCharacter(string calldata classType) external {
        require(bytes(characters[msg.sender].classType).length == 0, "Already created");
        characters[msg.sender] = Stats(0, 1, 5, 5, 5, classType);
        emit CharacterCreated(msg.sender, classType);
    }

    function gainXP(address player, uint256 amount) external {
        Stats storage s = characters[player];
        s.xp += amount;

        // Level up logic
        uint8 newLevel = uint8(s.xp / 1000) + 1;
        if (newLevel > s.level) {
            s.level = newLevel;
            s.strength += 1;
            s.agility += 1;
            s.intelligence += 1;
        }

        emit StatsUpdated(player, s.xp, s.level);
    }

    function getStats(address player) external view returns (Stats memory) {
        return characters[player];
    }
}
