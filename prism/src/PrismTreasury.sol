// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PrismTreasury {
    struct Position {
        uint256 balance;
        uint8 riskScore;
        uint64 lastUpdated;
    }

    mapping(address => Position) private positions;

    event Deposited(address indexed user, uint256 amount, uint8 riskScore);
    event Withdrawn(address indexed user, uint256 amount);
    event RiskScoreUpdated(address indexed user, uint8 riskScore);

    error ZeroAmount();
    error InvalidRiskScore();
    error InsufficientBalance();

    function deposit(uint8 riskScore) external payable {
        if (msg.value == 0) revert ZeroAmount();
        _validateRiskScore(riskScore);

        Position storage position = positions[msg.sender];
        position.balance += msg.value;
        position.riskScore = riskScore;
        position.lastUpdated = uint64(block.timestamp);

        emit Deposited(msg.sender, msg.value, riskScore);
    }

    function withdraw(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();

        Position storage position = positions[msg.sender];
        if (position.balance < amount) revert InsufficientBalance();

        position.balance -= amount;
        position.lastUpdated = uint64(block.timestamp);

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "TRANSFER_FAILED");

        emit Withdrawn(msg.sender, amount);
    }

    function updateRiskScore(uint8 riskScore) external {
        _validateRiskScore(riskScore);

        Position storage position = positions[msg.sender];
        position.riskScore = riskScore;
        position.lastUpdated = uint64(block.timestamp);

        emit RiskScoreUpdated(msg.sender, riskScore);
    }

    function myPosition()
        external
        view
        returns (uint256 balance, uint8 riskScore, uint64 lastUpdated)
    {
        Position memory position = positions[msg.sender];
        return (position.balance, position.riskScore, position.lastUpdated);
    }

    function positionOf(address user)
        external
        view
        returns (uint256 balance, uint8 riskScore, uint64 lastUpdated)
    {
        Position memory position = positions[user];
        return (position.balance, position.riskScore, position.lastUpdated);
    }

    receive() external payable {
        if (msg.value == 0) revert ZeroAmount();

        Position storage position = positions[msg.sender];
        uint8 score = position.riskScore == 0 ? 50 : position.riskScore;
        position.balance += msg.value;
        position.riskScore = score;
        position.lastUpdated = uint64(block.timestamp);

        emit Deposited(msg.sender, msg.value, score);
    }

    function _validateRiskScore(uint8 riskScore) private pure {
        if (riskScore == 0 || riskScore > 100) revert InvalidRiskScore();
    }
}

