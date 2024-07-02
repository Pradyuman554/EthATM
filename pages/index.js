import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [networkID, setNetworkID] = useState(null); // Initialize networkID state
  const [recipientAddress, setRecipientAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  const [withdrawAmount, setWithdrawAmount] = useState(""); // State to store the withdraw
  const [depositAmount, setDepositAmount] = useState(""); // State to store deposit amount
  const [darkMode, setDarkMode] = useState(false); // Dark Mode, Light mode

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
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
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
      const tx = await atm.deposit(depositAmount);
      await tx.wait();
      setDepositAmount(""); // Clear deposit amount after successful deposit
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm && withdrawAmount !== "") {
      const tx = await atm.withdraw(withdrawAmount);
      await tx.wait();
      setWithdrawAmount(""); // Clear withdrawal amount after successful withdrawal
      getBalance();
    }
  };

  const checkNetworkId = async () => {
    if (!ethWallet) {
      console.error("Ethereum provider not found.");
      return;
    }

    const provider = new ethers.providers.Web3Provider(ethWallet);
    const network = await provider.getNetwork();
    setNetworkID(network.chainId.toString());
  };

  const transferFunds = async (toAddress, amount) => {
    if (!ethWallet || !account) {
      alert("Wallet not connected");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(ethWallet);  //Creates a new Web3 provider using an existing Ethereum wallet.
      const signer = provider.getSigner();  //Retrieves the signer (account) to authorize transactions from the provider.
      const tx = await signer.sendTransaction({ //Sends the transaction to address, with ether
        to: toAddress,
        value: ethers.utils.parseEther(amount),
      });
      await tx.wait();
      console.log("Transaction confirmed:", tx);
      alert("Transfer successful!");
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transfer failed!");
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p className=
      {`${
        darkMode ? "text-white" : "text-black"
      } text-4xl font-black`}>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
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

    if (networkID === null) {
      checkNetworkId();
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
            >
              Withdraw
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center mt-8">
          <div className="grid grid-cols-2 gap-6 max-w-[500px]">
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="Recipient address"
              className="px-4 py-3 bg-gray-100 rounded-lg shadow-md focus:outline-none"
            />
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="Enter transfer amount (ETH)"
              className="px-4 py-3 bg-gray-100 rounded-lg shadow-md focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-center mt-4">
          <button
            className="bg-black text-white px-6 py-3 rounded-lg shadow-md focus:outline-none"
            onClick={() => transferFunds(recipientAddress, transferAmount)}
          >
            Transfer Funds
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main
      className={`container w-full h-screen bg-gradient-to-r ${
        darkMode
          ? "from-indigo-500 to-emerald-500 dark:from-gray-800 dark:to-black"
          : "from-indigo-500 to-sky-500"
      }`}
    >
      <header
        className={`${
          darkMode ? "text-white" : "text-black"
        } text-4xl font-black`}
      >
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