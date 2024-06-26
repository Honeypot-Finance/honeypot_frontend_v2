export const  faucetABI = [
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "outputs": [],
    "name": "faucet",
    "inputs": []
  },
  {
    "type": "function",
    "stateMutability": "view",
    "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }],
    "name": "balanceOf",
    "inputs": [
      { "type": "address", "name": "account", "internalType": "address" }
    ]
  }
] as const
