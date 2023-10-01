pragma solidity ^0.5.0;

contract TransactionDB {

function sendViaSend(address payable _to) public payable returns(bool){
	bool sent = _to.send(msg.value);
	require(sent, "Failed to send Ether");
	return sent;
}

function fund() external payable returns (bool){
     return true; 
    }
}
