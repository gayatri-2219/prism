// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/PrismTreasury.sol";

contract PrismTreasuryTest is Test {
    PrismTreasury internal treasury;
    address internal alice = address(0xA11CE);

    function setUp() public {
        treasury = new PrismTreasury();
        vm.deal(alice, 10 ether);
    }

    function testDepositStoresBalanceAndRiskScore() public {
        vm.prank(alice);
        treasury.deposit{value: 2 ether}(70);

        (uint256 balance, uint8 riskScore, ) = treasury.positionOf(alice);
        assertEq(balance, 2 ether);
        assertEq(riskScore, 70);
    }

    function testUpdateRiskScore() public {
        vm.startPrank(alice);
        treasury.deposit{value: 1 ether}(25);
        treasury.updateRiskScore(80);
        vm.stopPrank();

        (, uint8 riskScore, ) = treasury.positionOf(alice);
        assertEq(riskScore, 80);
    }

    function testWithdrawReducesBalance() public {
        vm.startPrank(alice);
        treasury.deposit{value: 3 ether}(60);
        treasury.withdraw(1 ether);
        vm.stopPrank();

        (uint256 balance, , ) = treasury.positionOf(alice);
        assertEq(balance, 2 ether);
    }

    function testWithdrawRevertsWhenBalanceIsTooLow() public {
        vm.prank(alice);
        treasury.deposit{value: 1 ether}(60);

        vm.prank(alice);
        vm.expectRevert(PrismTreasury.InsufficientBalance.selector);
        treasury.withdraw(2 ether);
    }

    function testDepositRejectsInvalidRiskScore() public {
        vm.prank(alice);
        vm.expectRevert(PrismTreasury.InvalidRiskScore.selector);
        treasury.deposit{value: 1 ether}(0);
    }
}

