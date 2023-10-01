var TransactionDB = artifacts.require("TransactionDB");

module.exports = function(deployer) {
  deployer.deploy(TransactionDB);
};
