// SPDX-License-Identifier: MIT
//pragma
pragma solidity ^0.8.8;
//imports
import "./PriceConverter.sol";
import "hardhat/console.sol";

//error codes
error FundMe__NotOwner();
error FundMe__SendingNotEnough();

//interfaces, libraries, contracts

/// @title A contract for crowd funding
/// @author Andriy-Bilenko
/// @notice This contract is for learning purposes only
/// @dev implements price feeds as our library
contract FundMe {
    //type declarations

    // state variables
    uint256 public constant MIN_USD = 50; //constants do not take storage (like macros)
    address[] private s_funders; //prefix s - storage, working with storage consts a ton of gas
    mapping(address => uint256) private s_addressToAmountFunded;
    address private immutable i_owner;
    AggregatorV3Interface private s_priceFeed;

    //events

    //modifiers
    modifier ownerExclusive() {
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        } // more new and gas efficient in comprarison to using "require"
        _;
    }

    //constructor, receive, fallback
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        // console.log("creating contract, owner: %s", msg.sender); //it consumes more gas, run with "yarn hardhat test"
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /// @notice this function funds this contract
    /// @dev adds sender address to s_funders if not already there and updates funded amount in s_addressToAmountFunded
    function fund() public payable {
        if (
            PriceConverter.getConversionRate(msg.value, s_priceFeed) / 1e18 <
            MIN_USD
        ) {
            revert FundMe__SendingNotEnough();
        }
        if (s_addressToAmountFunded[msg.sender] == 0) {
            s_funders.push(msg.sender);
        }
        s_addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public payable ownerExclusive {
        //setting all funds to 0
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            ++funderIndex
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        //resetting funders array
        delete s_funders;
        //sending ETH
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess);
    }

    function cheaperWithdraw() public payable ownerExclusive {
        address[] memory funders = s_funders;
        //setting all funds to 0
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            ++funderIndex
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        //resetting funders array
        delete s_funders;
        //sending ETH
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess);
    }

    function fundersNumber() public view returns (uint256) {
        return s_funders.length;
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
