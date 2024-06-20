# EthATM
This React application integrates with MetaMask to simulate an Ethereum ATM. It allows users to connect their wallets, view balances, deposit and withdraw Ether via interactions with a deployed Ethereum smart contract. The UI supports both light and dark themes and includes basic error handling and responsiveness.

### UserInterface(UI)
Dark Mode: Allows toggling between dark and light themes for UI.
User Initialization: Displays prompts and buttons based on wallet and account status:
Prompts to install MetaMask if not detected.
Button to connect MetaMask wallet if not connected.
Displays account details and balance once connected.

### setWithdrawAmount() and setDepositAmount()
Manages various states such as ethWallet, account, atm (contract instance), balance, withdrawAmount, depositAmount, and darkMode.
The input fields allow users to enter numerical amounts for depositing and withdrawing Ether in an Ethereum ATM simulation. Each input field is associated with a state variable (depositAmount and withdrawAmount respectively) that tracks the value entered by the user. The onChange event handler updates these state variables whenever the user types or modifies the input. This ensures that the UI reflects the current input value in real-time. 

### Directions:
Please open pages/index.js for displaying the react code
