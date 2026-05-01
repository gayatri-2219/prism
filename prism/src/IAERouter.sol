// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IAERouter
/// @notice Multi-strategy execution router for Initia EVM.
contract IAERouter {
    struct Position {
        uint256 totalDeposited;
        uint256 totalWithdrawn;
        uint8 riskScore;
        uint64 lastUpdated;
        uint8 strategyCount;
        bool autopilotEnabled;
    }

    struct StrategyAllocation {
        address protocolAddress;
        bytes4 functionSelector;
        uint256 allocatedAmount;
        uint256 currentValue;
        uint8 strategyType; // 0=swap, 1=LP, 2=lend, 3=stake
        uint256 minReturn;
        bool isActive;
    }

    mapping(address => Position) public positions;
    mapping(address => StrategyAllocation[]) public userStrategies;
    mapping(address => bool) public approvedProtocols;
    mapping(address => address) public sessionKeyOf;

    uint256 private _totalValueLocked;
    address public owner;
    bool public paused;

    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status = _NOT_ENTERED;

    error NotOwner();
    error Paused();
    error Reentrancy();
    error InvalidAmount();
    error InvalidRiskScore();
    error InvalidStrategyType();
    error EmptyStrategies();
    error TooManyStrategies();
    error ProtocolNotApproved(address protocol);
    error AllocationMismatch();
    error Unauthorized();
    error InsufficientBalance();
    error SessionKeyZero();

    event Deposited(
        address indexed user,
        uint256 indexed amount,
        uint8 indexed riskScore,
        uint8 strategyCount,
        uint256 timestamp
    );
    event Withdrawn(address indexed user, uint256 indexed amount, uint256 timestamp);
    event Rebalanced(
        address indexed user,
        uint8 indexed oldCount,
        uint8 indexed newCount,
        uint256 timestamp
    );
    event RiskScoreUpdated(address indexed user, uint8 indexed oldScore, uint8 indexed newScore);
    event AutopilotToggled(address indexed user, bool indexed enabled);
    event AutopilotExecuted(
        address indexed user,
        address indexed executor,
        uint8 indexed strategyCount,
        uint256 timestamp
    );
    event ProtocolApproved(address indexed protocol, bool indexed approved);
    event SessionKeyRegistered(address indexed user, address indexed key);
    event SessionKeyRevoked(address indexed user, address indexed key);
    event StrategyRouted(
        address indexed user,
        address indexed protocol,
        uint8 indexed strategyType,
        uint256 amount,
        uint256 minReturn,
        bytes4 selector,
        bool success,
        bytes returndata,
        uint256 timestamp
    );

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert Paused();
        _;
    }

    modifier nonReentrant() {
        if (_status == _ENTERED) revert Reentrancy();
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {
        if (msg.value == 0) revert InvalidAmount();

        Position storage p = positions[msg.sender];
        if (p.riskScore == 0) {
            p.riskScore = 50;
        }
        p.totalDeposited += msg.value;
        p.lastUpdated = uint64(block.timestamp);

        _totalValueLocked += msg.value;

        emit Deposited(
            msg.sender,
            msg.value,
            p.riskScore,
            p.strategyCount,
            block.timestamp
        );
    }

    function deposit(
        uint8 riskScore,
        StrategyAllocation[] calldata strategies
    ) external payable whenNotPaused nonReentrant {
        if (msg.value == 0) revert InvalidAmount();
        _validateRisk(riskScore);

        uint256 strategyLen = strategies.length;
        if (strategyLen == 0) revert EmptyStrategies();
        if (strategyLen > type(uint8).max) revert TooManyStrategies();

        uint256 totalAllocation;
        for (uint256 i = 0; i < strategyLen; i++) {
            StrategyAllocation calldata s = strategies[i];
            if (!approvedProtocols[s.protocolAddress]) {
                revert ProtocolNotApproved(s.protocolAddress);
            }
            if (s.strategyType > 3) revert InvalidStrategyType();
            if (s.allocatedAmount == 0) revert InvalidAmount();
            totalAllocation += s.allocatedAmount;
        }

        if (totalAllocation != msg.value) revert AllocationMismatch();

        Position storage p = positions[msg.sender];
        p.totalDeposited += msg.value;
        p.riskScore = riskScore;
        p.lastUpdated = uint64(block.timestamp);
        p.strategyCount = uint8(strategyLen);

        _totalValueLocked += msg.value;

        _setUserStrategies(msg.sender, strategies);

        for (uint256 i = 0; i < strategyLen; i++) {
            StrategyAllocation calldata s = strategies[i];
            _routeToProtocol(msg.sender, s);
        }

        emit Deposited(
            msg.sender,
            msg.value,
            riskScore,
            uint8(strategyLen),
            block.timestamp
        );
    }

    function withdraw(
        uint256 amount,
        bool withdrawAll
    ) external whenNotPaused nonReentrant {
        Position storage p = positions[msg.sender];
        uint256 currentBalance = p.totalDeposited - p.totalWithdrawn;

        if (withdrawAll) {
            amount = currentBalance;
        }

        if (amount == 0) revert InvalidAmount();
        if (currentBalance < amount) revert InsufficientBalance();

        StrategyAllocation[] storage strategies = userStrategies[msg.sender];
        uint256 strategyLen = strategies.length;
        uint256 totalAllocated;

        for (uint256 i = 0; i < strategyLen; i++) {
            if (strategies[i].isActive) {
                totalAllocated += strategies[i].allocatedAmount;
            }
        }

        uint256 remaining = amount;
        if (totalAllocated > 0) {
            uint256 activeSeen;
            uint256 activeTotal;
            for (uint256 i = 0; i < strategyLen; i++) {
                if (strategies[i].isActive && strategies[i].allocatedAmount > 0) {
                    activeTotal++;
                }
            }

            for (uint256 i = 0; i < strategyLen; i++) {
                StrategyAllocation storage s = strategies[i];
                if (!s.isActive || s.allocatedAmount == 0) continue;
                activeSeen++;

                uint256 piece = (activeSeen == activeTotal)
                    ? remaining
                    : (amount * s.allocatedAmount) / totalAllocated;

                if (piece > s.allocatedAmount) {
                    piece = s.allocatedAmount;
                }

                if (piece > 0) {
                    s.allocatedAmount -= piece;
                    if (s.currentValue > piece) {
                        s.currentValue -= piece;
                    } else {
                        s.currentValue = 0;
                    }

                    if (s.allocatedAmount == 0) {
                        s.isActive = false;
                    }

                    remaining -= piece;
                    _attemptUnwind(msg.sender, s, piece);
                }
            }
        }

        p.totalWithdrawn += amount;
        p.lastUpdated = uint64(block.timestamp);
        _refreshStrategyCount(msg.sender);

        _totalValueLocked -= amount;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "TRANSFER_FAILED");

        emit Withdrawn(msg.sender, amount, block.timestamp);
    }

    function rebalance(
        StrategyAllocation[] calldata newStrategies
    ) external whenNotPaused nonReentrant {
        uint256 newLen = newStrategies.length;
        if (newLen == 0) revert EmptyStrategies();
        if (newLen > type(uint8).max) revert TooManyStrategies();

        uint256 currentBalance =
            positions[msg.sender].totalDeposited - positions[msg.sender].totalWithdrawn;

        uint256 totalAllocation;
        for (uint256 i = 0; i < newLen; i++) {
            StrategyAllocation calldata s = newStrategies[i];
            if (!approvedProtocols[s.protocolAddress]) {
                revert ProtocolNotApproved(s.protocolAddress);
            }
            if (s.strategyType > 3) revert InvalidStrategyType();
            totalAllocation += s.allocatedAmount;
        }

        if (totalAllocation > currentBalance) revert InsufficientBalance();

        uint8 oldCount = positions[msg.sender].strategyCount;

        _setUserStrategies(msg.sender, newStrategies);

        Position storage p = positions[msg.sender];
        p.strategyCount = uint8(newLen);
        p.lastUpdated = uint64(block.timestamp);

        for (uint256 i = 0; i < newLen; i++) {
            _routeToProtocol(msg.sender, newStrategies[i]);
        }

        emit Rebalanced(msg.sender, oldCount, uint8(newLen), block.timestamp);
    }

    function updateRiskScore(uint8 newScore) external whenNotPaused {
        _validateRisk(newScore);

        Position storage p = positions[msg.sender];
        uint8 oldScore = p.riskScore;
        p.riskScore = newScore;
        p.lastUpdated = uint64(block.timestamp);

        emit RiskScoreUpdated(msg.sender, oldScore, newScore);
    }

    function enableAutopilot(bool enabled) external whenNotPaused {
        Position storage p = positions[msg.sender];
        p.autopilotEnabled = enabled;
        p.lastUpdated = uint64(block.timestamp);

        emit AutopilotToggled(msg.sender, enabled);
    }

    function executeAutopilot(
        address user,
        StrategyAllocation[] calldata strategies
    ) external whenNotPaused nonReentrant {
        if (msg.sender != owner && msg.sender != sessionKeyOf[user]) {
            revert Unauthorized();
        }
        if (!positions[user].autopilotEnabled) revert Unauthorized();

        uint256 len = strategies.length;
        if (len == 0) revert EmptyStrategies();
        if (len > type(uint8).max) revert TooManyStrategies();

        uint256 currentBalance =
            positions[user].totalDeposited - positions[user].totalWithdrawn;

        uint256 totalAllocation;
        for (uint256 i = 0; i < len; i++) {
            StrategyAllocation calldata s = strategies[i];
            if (!approvedProtocols[s.protocolAddress]) {
                revert ProtocolNotApproved(s.protocolAddress);
            }
            if (s.strategyType > 3) revert InvalidStrategyType();
            totalAllocation += s.allocatedAmount;
        }

        if (totalAllocation > currentBalance) revert InsufficientBalance();

        _setUserStrategies(user, strategies);

        Position storage p = positions[user];
        p.strategyCount = uint8(len);
        p.lastUpdated = uint64(block.timestamp);

        for (uint256 i = 0; i < len; i++) {
            _routeToProtocol(user, strategies[i]);
        }

        emit AutopilotExecuted(user, msg.sender, uint8(len), block.timestamp);
    }

    function registerSessionKey(address key) external whenNotPaused {
        if (key == address(0)) revert SessionKeyZero();
        sessionKeyOf[msg.sender] = key;
        emit SessionKeyRegistered(msg.sender, key);
    }

    function revokeSessionKey() external whenNotPaused {
        address existing = sessionKeyOf[msg.sender];
        sessionKeyOf[msg.sender] = address(0);
        emit SessionKeyRevoked(msg.sender, existing);
    }

    function setProtocolApproval(address protocol, bool approved) external onlyOwner {
        approvedProtocols[protocol] = approved;
        emit ProtocolApproved(protocol, approved);
    }

    function pause() external onlyOwner {
        paused = true;
    }

    function unpause() external onlyOwner {
        paused = false;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert Unauthorized();
        owner = newOwner;
    }

    function updateStrategyCurrentValue(
        address user,
        uint256 index,
        uint256 currentValue
    ) external onlyOwner {
        StrategyAllocation[] storage strategies = userStrategies[user];
        require(index < strategies.length, "INDEX_OOB");
        strategies[index].currentValue = currentValue;
        positions[user].lastUpdated = uint64(block.timestamp);
    }

    function myPosition() external view returns (Position memory) {
        return positions[msg.sender];
    }

    function positionOf(address user) external view returns (Position memory) {
        return positions[user];
    }

    function myStrategies() external view returns (StrategyAllocation[] memory) {
        return userStrategies[msg.sender];
    }

    function totalValueLocked() external view returns (uint256) {
        return _totalValueLocked;
    }

    function protocolIsApproved(address protocol) external view returns (bool) {
        return approvedProtocols[protocol];
    }

    function _validateRisk(uint8 score) private pure {
        if (score < 1 || score > 100) revert InvalidRiskScore();
    }

    function _setUserStrategies(
        address user,
        StrategyAllocation[] calldata strategies
    ) private {
        delete userStrategies[user];
        for (uint256 i = 0; i < strategies.length; i++) {
            userStrategies[user].push(
                StrategyAllocation({
                    protocolAddress: strategies[i].protocolAddress,
                    functionSelector: strategies[i].functionSelector,
                    allocatedAmount: strategies[i].allocatedAmount,
                    currentValue: strategies[i].currentValue,
                    strategyType: strategies[i].strategyType,
                    minReturn: strategies[i].minReturn,
                    isActive: strategies[i].isActive
                })
            );
        }
    }

    function _routeToProtocol(address user, StrategyAllocation calldata s) private {
        bytes memory callData = abi.encodeWithSelector(
            s.functionSelector,
            s.allocatedAmount,
            s.minReturn,
            user
        );

        (bool ok, bytes memory ret) = s.protocolAddress.call{value: s.allocatedAmount}(callData);

        emit StrategyRouted(
            user,
            s.protocolAddress,
            s.strategyType,
            s.allocatedAmount,
            s.minReturn,
            s.functionSelector,
            ok,
            ret,
            block.timestamp
        );
    }

    function _attemptUnwind(
        address user,
        StrategyAllocation storage s,
        uint256 piece
    ) private {
        bytes memory callData = abi.encodeWithSelector(
            s.functionSelector,
            piece,
            uint256(0),
            user
        );

        (bool ok, bytes memory ret) = s.protocolAddress.call(callData);

        emit StrategyRouted(
            user,
            s.protocolAddress,
            s.strategyType,
            piece,
            0,
            s.functionSelector,
            ok,
            ret,
            block.timestamp
        );
    }

    function _refreshStrategyCount(address user) private {
        StrategyAllocation[] storage strategies = userStrategies[user];
        uint256 len = strategies.length;
        uint8 activeCount;
        for (uint256 i = 0; i < len; i++) {
            if (strategies[i].isActive) activeCount++;
        }
        positions[user].strategyCount = activeCount;
    }
}
