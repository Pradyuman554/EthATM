// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    bool public paused = false;
    uint256 public constant MIN_AMOUNT = 1 ether;
    uint256 public constant MAX_AMOUNT = 100 ether;

    struct Transaction {
        uint256 amount;
        string transactionType;
        uint256 timestamp;
    }

    Transaction[] public transactionHistory;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event Paused(bool isPaused);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner of this account");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable onlyOwner whenNotPaused {
        require(_amount >= MIN_AMOUNT, "Amount is below minimum limit");
        require(_amount <= MAX_AMOUNT, "Amount is above maximum limit");

        uint256 _previousBalance = balance;
        balance += _amount;

        assert(balance == _previousBalance + _amount);

        transactionHistory.push(Transaction(_amount, "Deposit", block.timestamp));

        emit Deposit(_amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public onlyOwner whenNotPaused {
        require(_withdrawAmount >= MIN_AMOUNT, "Amount is below minimum limit");
        require(_withdrawAmount <= MAX_AMOUNT, "Amount is above maximum limit");

        uint256 _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        balance -= _withdrawAmount;

        assert(balance == (_previousBalance - _withdrawAmount));

        transactionHistory.push(Transaction(_withdrawAmount, "Withdraw", block.timestamp));

        emit Withdraw(_withdrawAmount);
    }

    function pauseContract() public onlyOwner {
        paused = true;
        emit Paused(paused);
    }

    function resumeContract() public onlyOwner {
        paused = false;
        emit Paused(paused);
    }

    function getTransactionHistory() public view returns (Transaction[] memory) {
        return transactionHistory;
    }
}
