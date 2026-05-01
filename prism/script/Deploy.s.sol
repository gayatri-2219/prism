// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/StdJson.sol";
import "../src/PrismTreasury.sol";

contract DeployPrismTreasury is Script {
    using stdJson for string;

    function run() external returns (PrismTreasury treasury) {
        uint256 pk = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(pk);
        treasury = new PrismTreasury();
        vm.stopBroadcast();

        bytes32 deployTxHash = vm.envOr("DEPLOY_TX_HASH", bytes32(0));

        string memory obj;
        obj = vm.serializeAddress("deploy", "contractAddress", address(treasury));
        obj = vm.serializeBytes32("deploy", "deployTxHash", deployTxHash);
        obj = vm.serializeUint("deploy", "blockNumber", block.number);
        obj = vm.serializeUint("deploy", "timestamp", block.timestamp);
        vm.writeJson(obj, "./deploy.json");

        console2.log("PrismTreasury deployed at:", address(treasury));
        console2.log("deploy.json written to prism/deploy.json");
    }
}
