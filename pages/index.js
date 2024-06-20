import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  
  const [withdrawAmount, setWithdrawAmount] = useState(""); //State to store the withdraw
  const [depositAmount, setDepositAmount] = useState(""); // State to store deposit amount
  const [darkMode, setDarkMode] = useState(false);  //Dark Mode, Light mode

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
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
      const balance = await atm.getBalance();
      setBalance(balance.toNumber());
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

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask in order to use this ATM.</p>;
    }

    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your MetaMask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Account: {account}</p>
        <p>Balance: {balance}</p>
        <div>
          <input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Enter deposit amount"
            style={{ marginRight: "10px" }}
          />
          <button onClick={deposit}>Deposit</button>
        </div>
        <div>
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Enter withdrawal amount"
            style={{ marginRight: "10px", marginTop: "10px" }}
          />
          <button onClick={withdraw}>Withdraw</button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className={`container ${darkMode ? "dark" : ""}`}>
      <header>
        <h1>Welcome to your local Ethereum ATM!</h1>
        <button onClick={() => setDarkMode(!darkMode)}>
          Toggle Dark Mode
        </button>
      </header>
      {initUser()}
      <style jsx>{`
      h1{
        text-decoration: underline;
      }
        .container {
          text-align: center;
          background-color: white;
          color: black;
          transition: background-color 0.5s, color 0.5s;
          min-height: 100vh; /* Ensure container covers the full height of the viewport */
        }
        .container.dark {
          background-color: black;
          color: white;
        }
        body {
          margin: 0; /* Remove default margin to avoid scroll bars */
        }
        button {
          margin-top: 10px;
          padding: 10px 20px;
          cursor: pointer;
        }
        input {
          padding: 8px;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 4px;
          margin-bottom: 10px;
        }
      `}</style>
    </main>
  );
}
