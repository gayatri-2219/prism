// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/IAERouter.sol";

contract MockProtocol {
    event ProtocolCalled(uint256 amount, uint256 minReturn, address user, uint256 value);

    function execute(
        uint256 amount,
        uint256 minReturn,
        address user
    ) external payable returns (bool) {
        emit ProtocolCalled(amount, minReturn, user, msg.value);
        return true;
    }
}

contract ReentrantUser {
    IAERouter public immutable router;
    bool public attempted;

    constructor(IAERouter _router) {
        router = _router;
    }

    receive() external payable {
        if (!attempted) {
            attempted = true;
            try router.withdraw(1 wei, false) {
                revert("reentrancy unexpectedly succeeded");
            } catch {}
        }
    }

    function attackDepositAndWithdraw(
        uint8 risk,
        IAERouter.StrategyAllocation[] memory input
    ) external payable {
        router.deposit{value: msg.value}(risk, input);
        router.withdraw(msg.value, true);
    }
}

contract IAERouterTest is Test {
    IAERouter internal router;
    MockProtocol internal protocolA;
    MockProtocol internal protocolB;
    MockProtocol internal protocolC;

    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);
    address internal sessionKey = address(0x515E510);

    function setUp() public {
        router = new IAERouter();
        protocolA = new MockProtocol();
        protocolB = new MockProtocol();
        protocolC = new MockProtocol();

        router.setProtocolApproval(address(protocolA), true);
        router.setProtocolApproval(address(protocolB), true);
        router.setProtocolApproval(address(protocolC), true);

        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
    }

    function _singleStrategy(
        address protocol,
        uint256 amount,
        uint8 strategyType
    ) internal pure returns (IAERouter.StrategyAllocation[] memory strategies) {
        strategies = new IAERouter.StrategyAllocation[](1);
        strategies[0] = IAERouter.StrategyAllocation({
            protocolAddress: protocol,
            functionSelector: MockProtocol.execute.selector,
            allocatedAmount: amount,
            currentValue: amount,
            strategyType: strategyType,
            minReturn: 1,
            isActive: true
        });
    }

    function testDepositSingleStrategy() public {
        IAERouter.StrategyAllocation[] memory strategies =
            _singleStrategy(address(protocolA), 1 ether, 0);

        vm.prank(alice);
        router.deposit{value: 1 ether}(55, strategies);

        IAERouter.Position memory p = router.positionOf(alice);
        assertEq(p.totalDeposited, 1 ether);
        assertEq(p.totalWithdrawn, 0);
        assertEq(p.riskScore, 55);
        assertEq(p.strategyCount, 1);
        assertEq(router.totalValueLocked(), 1 ether);

        IAERouter.StrategyAllocation[] memory saved;
        vm.prank(alice);
        saved = router.myStrategies();
        assertEq(saved.length, 1);
        assertEq(saved[0].allocatedAmount, 1 ether);
    }

    function testDepositMultipleStrategies() public {
        IAERouter.StrategyAllocation[] memory strategies =
            new IAERouter.StrategyAllocation[](3);

        strategies[0] = IAERouter.StrategyAllocation({
            protocolAddress: address(protocolA),
            functionSelector: MockProtocol.execute.selector,
            allocatedAmount: 1 ether,
            currentValue: 1 ether,
            strategyType: 0,
            minReturn: 1,
            isActive: true
        });
        strategies[1] = IAERouter.StrategyAllocation({
            protocolAddress: address(protocolB),
            functionSelector: MockProtocol.execute.selector,
            allocatedAmount: 2 ether,
            currentValue: 2 ether,
            strategyType: 1,
            minReturn: 1,
            isActive: true
        });
        strategies[2] = IAERouter.StrategyAllocation({
            protocolAddress: address(protocolC),
            functionSelector: MockProtocol.execute.selector,
            allocatedAmount: 3 ether,
            currentValue: 3 ether,
            strategyType: 2,
            minReturn: 1,
            isActive: true
        });

        vm.prank(alice);
        router.deposit{value: 6 ether}(48, strategies);

        IAERouter.Position memory p = router.positionOf(alice);
        assertEq(p.totalDeposited, 6 ether);
        assertEq(p.strategyCount, 3);
        assertEq(router.totalValueLocked(), 6 ether);
    }

    function testWithdrawFullAmount() public {
        IAERouter.StrategyAllocation[] memory strategies =
            _singleStrategy(address(protocolA), 2 ether, 3);

        vm.startPrank(alice);
        router.deposit{value: 2 ether}(40, strategies);
        uint256 before = alice.balance;
        router.withdraw(0, true);
        vm.stopPrank();

        IAERouter.Position memory p = router.positionOf(alice);
        assertEq(p.totalWithdrawn, 2 ether);
        assertEq(router.totalValueLocked(), 0);
        assertEq(alice.balance, before + 2 ether);
    }

    function testWithdrawPartialAmount() public {
        IAERouter.StrategyAllocation[] memory strategies =
            _singleStrategy(address(protocolA), 4 ether, 1);

        vm.startPrank(alice);
        router.deposit{value: 4 ether}(70, strategies);
        router.withdraw(1.5 ether, false);
        vm.stopPrank();

        IAERouter.Position memory p = router.positionOf(alice);
        assertEq(p.totalDeposited, 4 ether);
        assertEq(p.totalWithdrawn, 1.5 ether);
        assertEq(router.totalValueLocked(), 2.5 ether);
    }

    function testRebalanceBetweenStrategies() public {
        IAERouter.StrategyAllocation[] memory original =
            _singleStrategy(address(protocolA), 5 ether, 0);

        vm.prank(alice);
        router.deposit{value: 5 ether}(50, original);

        IAERouter.StrategyAllocation[] memory rebalanced =
            new IAERouter.StrategyAllocation[](2);
        rebalanced[0] = IAERouter.StrategyAllocation({
            protocolAddress: address(protocolB),
            functionSelector: MockProtocol.execute.selector,
            allocatedAmount: 2 ether,
            currentValue: 2 ether,
            strategyType: 2,
            minReturn: 1,
            isActive: true
        });
        rebalanced[1] = IAERouter.StrategyAllocation({
            protocolAddress: address(protocolC),
            functionSelector: MockProtocol.execute.selector,
            allocatedAmount: 3 ether,
            currentValue: 3 ether,
            strategyType: 3,
            minReturn: 1,
            isActive: true
        });

        vm.prank(alice);
        router.rebalance(rebalanced);

        IAERouter.Position memory p = router.positionOf(alice);
        assertEq(p.strategyCount, 2);
    }

    function testSessionKeyRegistrationAndAutopilotExecution() public {
        IAERouter.StrategyAllocation[] memory strategies =
            _singleStrategy(address(protocolA), 3 ether, 0);

        vm.startPrank(alice);
        router.deposit{value: 3 ether}(64, strategies);
        router.registerSessionKey(sessionKey);
        router.enableAutopilot(true);
        vm.stopPrank();

        IAERouter.StrategyAllocation[] memory autoStrategies =
            _singleStrategy(address(protocolB), 3 ether, 2);

        vm.prank(sessionKey);
        router.executeAutopilot(alice, autoStrategies);

        IAERouter.Position memory p = router.positionOf(alice);
        assertEq(p.strategyCount, 1);
    }

    function testReentrancyAttackPrevention() public {
        ReentrantUser attacker = new ReentrantUser(router);
        vm.deal(address(attacker), 10 ether);

        IAERouter.StrategyAllocation[] memory strategies =
            _singleStrategy(address(protocolA), 1 ether, 0);

        attacker.attackDepositAndWithdraw{value: 1 ether}(50, strategies);
        assertTrue(attacker.attempted());
    }

    function testUnauthorizedAccessPrevention() public {
        IAERouter.StrategyAllocation[] memory strategies =
            _singleStrategy(address(protocolA), 2 ether, 1);

        vm.prank(alice);
        router.deposit{value: 2 ether}(42, strategies);

        IAERouter.StrategyAllocation[] memory other =
            _singleStrategy(address(protocolB), 2 ether, 2);

        vm.expectRevert(IAERouter.Unauthorized.selector);
        vm.prank(bob);
        router.executeAutopilot(alice, other);

        vm.expectRevert(IAERouter.NotOwner.selector);
        vm.prank(bob);
        router.setProtocolApproval(address(protocolA), false);
    }

    function testPauseAndUnpause() public {
        IAERouter.StrategyAllocation[] memory strategies =
            _singleStrategy(address(protocolA), 1 ether, 1);

        router.pause();

        vm.expectRevert(IAERouter.Paused.selector);
        vm.prank(alice);
        router.deposit{value: 1 ether}(40, strategies);

        router.unpause();

        vm.prank(alice);
        router.deposit{value: 1 ether}(40, strategies);

        IAERouter.Position memory p = router.positionOf(alice);
        assertEq(p.totalDeposited, 1 ether);
    }
}
