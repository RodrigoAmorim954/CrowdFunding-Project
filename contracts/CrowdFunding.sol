// SPDX-License-Identifier: UNLICENSED
// Pragma
pragma solidity ^0.8.8;

// Imports
import "./PriceConverter.sol";

// Error Codes
error CrowdFunding__NotOwner();
error CrowdFunding__NotEnoughEther();
error CrowdFunding__CallFailed();

// Interfaces, Libraries, Contracts

/**
 * @title A contract for crowd funding
 * @author Rodrigo Rocha Amorim
 * @notice This contract is a simple funding contract using Chain Link data feeds
 * @dev This implements price feeds as our librarie
 */

contract CrowdFunding {
    // Type Declarations
    using PriceConverter for uint256;

    // State Variables
    uint256 public constant MINIMUM_USD = 50e8;
    address private immutable i_owner;

    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFunded;
    AggregatorV3Interface public s_priceFeed;

    // Events

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != i_owner) revert CrowdFunding__NotOwner();
        _;
    }

    // Functions
    // constructor
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // receive
    receive() external payable {
        fund();
    }

    // fallback
    fallback() external payable {
        fund();
    }

    // external

    // public
    function fund() public payable {
        if (msg.value.getConversionRate(s_priceFeed) < MINIMUM_USD)
            revert CrowdFunding__NotEnoughEther();

        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    function withdraw() public onlyOwner {
        address[] memory funders = s_funders;
        for (uint256 index = 0; index < funders.length; index++) {
            address funder = funders[index];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0); // Empty the array

        (bool callSucess, ) = i_owner.call{value: address(this).balance}(""); // Withdraw the funds
        if (!callSucess) revert CrowdFunding__CallFailed();
    }

    function getFunders(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getAddressToAmountFunded(
        address fundingAddress
    ) public view returns (uint256) {
        return s_addressToAmountFunded[fundingAddress];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    // internal
    // private
    // view / pure
}
