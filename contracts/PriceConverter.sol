// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    // Libraries can't have any state variables, can't sent ether and all the function needs to be internal

    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        // We need the address and ABI to interact with another contract
        // ABI: We can get the Abi using the contract Interface (the import above)
        // The contract address can be found at: https://docs.chain.link/data-feeds/price-feeds/addresses
        // Goerli ETH/USD Contract Address: 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        // Sepolia ETH/USD Contract Address: 0x694AA1769357215DE4FAC081bf1f309aDC325306

        (, int256 price, , , ) = priceFeed.latestRoundData(); // The answer comes with 8 decimals

        return uint256(price * 1e10); // We return the answer with 18 decimals (to be equivalent with wei)
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;

        return ethAmountInUsd;
    }
}
