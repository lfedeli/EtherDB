pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/TransactionDB.sol"; // Update the path if necessary

contract TransactionDBTest {
    // Initialize the contract with the deployed address of the TransactionDB contract
    TransactionDB transactionDB = TransactionDB(DeployedAddresses.TransactionDB());

    // Test the fund function
    function testFund() public payable {
        bool success = transactionDB.fund();
        
        // Check if the transaction was successful
        Assert.isTrue(success, "Sending Ether to fund should be successful");
    }
}

