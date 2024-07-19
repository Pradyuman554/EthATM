import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [networkID, setNetworkID] = useState(null);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [paused, setPaused] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      setAccount(account);
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm && depositAmount !== "") {
      const tx = await atm.deposit(ethers.utils.parseEther(depositAmount));
      await tx.wait();
      setDepositAmount("");
      getBalance();
      getTransactionHistory();
    }
  };

  const withdraw = async () => {
    if (atm && withdrawAmount !== "") {
      const tx = await atm.withdraw(ethers.utils.parseEther(withdrawAmount));
      await tx.wait();
      setWithdrawAmount("");
      getBalance();
      getTransactionHistory();
    }
  };

  const pauseContract = async () => {
    if (atm) {
      const tx = await atm.pauseContract();
      await tx.wait();
      setPaused(true);
    }
  };

  const resumeContract = async () => {
    if (atm) {
      const tx = await atm.resumeContract();
      await tx.wait();
      setPaused(false);
    }
  };

  const getTransactionHistory = async () => {
    if (atm) {
      const history = await atm.getTransactionHistory();
      setTransactionHistory(history);
    }
  };

  useEffect(() => {
    getWallet();
  }, []);

  useEffect(() => {
    if (account) {
      getBalance();
      getTransactionHistory();
    }
  }, [account]);

  const renderTransactionHistory = () => {
    return transactionHistory.map((tx, index) => (
      <li key={index} className="mt-2">
        <p>Type: {tx.transactionType}</p>
        <p>Amount: {ethers.utils.formatEther(tx.amount)} ETH</p>
        <p>Timestamp: {new Date(tx.timestamp * 1000).toLocaleString()}</p>
      </li>
    ));
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p className={`${
        darkMode ? "text-white" : "text-black"
      } text-4xl font-black`}>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your Metamask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <div className="flex justify-center items-center mt-6">
          <p className="text-white text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 rounded-lg shadow-lg">
            Your Account:
          </p>
          <p className="text-lg ml-2 bg-gray-100 px-4 py-2 rounded-lg shadow-md">
            {account}
          </p>
        </div>

        <p className="text-2xl font-semibold text-center mt-8 p-4 rounded-lg shadow-md bg-gradient-to-r from-blue-400 to-purple-600 text-white">
          Your Balance: {balance} ETH
        </p>

        <div className="flex items-center justify-center">
          <div className="grid grid-cols-2 gap-6 max-w-[500px] mt-8">
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Enter deposit amount"
              className="px-4 py-3 bg-gray-100 rounded-lg shadow-md focus:outline-none"
            />
            <button
              className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600 focus:outline-none"
              onClick={deposit}
              disabled={paused}
            >
              Deposit
            </button>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Enter withdrawal amount"
              className="px-4 py-3 bg-gray-100 rounded-lg shadow-md focus:outline-none"
            />
            <button
              className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-600 focus:outline-none"
              onClick={withdraw}
              disabled={paused}
            >
              Withdraw
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center mt-8">
          <div className="grid grid-cols-2 gap-6 max-w-[500px]">
            <button
              className="bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-yellow-600 focus:outline-none"
              onClick={pauseContract}
              disabled={paused}
            >
              Pause Contract
            </button>
            <button
              className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none"
              onClick={resumeContract}
              disabled={!paused}
            >
              Resume Contract
            </button>
          </div>
        </div>

        <div className="mt-8">
          <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-black"}`}>
            Transaction History
          </h2>
          <ul>{renderTransactionHistory()}</ul>
        </div>
      </div>
    );
  };

  return (
    <main
      className={`container w-full h-screen bg-gradient-to-r ${
        darkMode
          ? "from-indigo-500 to-emerald-500 dark:from-gray-800 dark:to-black"
          : "from-indigo-500 to-sky-500"
      }`}
    >
      <header className={`${darkMode ? "text-white" : "text-black"} text-4xl font-black`}>
        <h1 className="pt-[50px]">Welcome to Pradyuman's ATM!</h1>
      </header>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="mt-4 px-4 py-2 bg-white text-black rounded-md shadow-md hover:bg-gray-200 dark:bg-gray-800 dark:text-white mb-5"
      >
        Toggle Dark Mode
      </button>
      {initUser()}
      <style jsx>
        {`
          .container {
            text-align: center;
          }
        `}
      </style>
    </main>
  );
}
