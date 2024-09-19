export const BerachainRewardsVaultFactoryABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_bgt",
        type: "address",
      },
      {
        internalType: "address",
        name: "_distributor",
        type: "address",
      },
      {
        internalType: "address",
        name: "_berachef",
        type: "address",
      },
      {
        internalType: "address",
        name: "_governance",
        type: "address",
      },
      {
        internalType: "address",
        name: "_vaultImpl",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AlreadyInitialized",
    type: "error",
  },
  {
    inputs: [],
    name: "AmountLessThanMinIncentiveRate",
    type: "error",
  },
  {
    inputs: [],
    name: "BlockDoesNotExist",
    type: "error",
  },
  {
    inputs: [],
    name: "BlockNotInBuffer",
    type: "error",
  },
  {
    inputs: [],
    name: "CannotRecoverRewardToken",
    type: "error",
  },
  {
    inputs: [],
    name: "CannotRecoverStakingToken",
    type: "error",
  },
  {
    inputs: [],
    name: "DelegateStakedOverflow",
    type: "error",
  },
  {
    inputs: [],
    name: "InsolventReward",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientDelegateStake",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientSelfStake",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientStake",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidCommission",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidCuttingBoardWeights",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidMaxIncentiveTokensCount",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidMinter",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidStartBlock",
    type: "error",
  },
  {
    inputs: [],
    name: "InvariantCheckFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "MaxNumWeightsPerCuttingBoardIsZero",
    type: "error",
  },
  {
    inputs: [],
    name: "NoWhitelistedTokens",
    type: "error",
  },
  {
    inputs: [],
    name: "NotActionableBlock",
    type: "error",
  },
  {
    inputs: [],
    name: "NotApprovedSender",
    type: "error",
  },
  {
    inputs: [],
    name: "NotBGT",
    type: "error",
  },
  {
    inputs: [],
    name: "NotBlockRewardController",
    type: "error",
  },
  {
    inputs: [],
    name: "NotDelegate",
    type: "error",
  },
  {
    inputs: [],
    name: "NotDistributor",
    type: "error",
  },
  {
    inputs: [],
    name: "NotEnoughBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "NotEnoughTime",
    type: "error",
  },
  {
    inputs: [],
    name: "NotFeeCollector",
    type: "error",
  },
  {
    inputs: [],
    name: "NotFriendOfTheChef",
    type: "error",
  },
  {
    inputs: [],
    name: "NotGovernance",
    type: "error",
  },
  {
    inputs: [],
    name: "NotOperator",
    type: "error",
  },
  {
    inputs: [],
    name: "NotProver",
    type: "error",
  },
  {
    inputs: [],
    name: "NotRootFollower",
    type: "error",
  },
  {
    inputs: [],
    name: "NotValidatorOrOperator",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "PayoutAmountIsZero",
    type: "error",
  },
  {
    inputs: [],
    name: "PayoutTokenIsZero",
    type: "error",
  },
  {
    inputs: [],
    name: "QueuedCuttingBoardNotFound",
    type: "error",
  },
  {
    inputs: [],
    name: "QueuedCuttingBoardNotReady",
    type: "error",
  },
  {
    inputs: [],
    name: "RewardCycleNotEnded",
    type: "error",
  },
  {
    inputs: [],
    name: "StakeAmountIsZero",
    type: "error",
  },
  {
    inputs: [],
    name: "TokenAlreadyWhitelistedOrLimitReached",
    type: "error",
  },
  {
    inputs: [],
    name: "TokenNotWhitelisted",
    type: "error",
  },
  {
    inputs: [],
    name: "TooManyWeights",
    type: "error",
  },
  {
    inputs: [],
    name: "TotalSupplyOverflow",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "Unauthorized",
    type: "error",
  },
  {
    inputs: [],
    name: "VaultAlreadyExists",
    type: "error",
  },
  {
    inputs: [],
    name: "WithdrawAmountIsZero",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroAddress",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "stakingToken",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "vault",
        type: "address",
      },
    ],
    name: "VaultCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "allVaults",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "allVaultsLength",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "beacon",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "berachef",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "bgt",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "stakingToken",
        type: "address",
      },
    ],
    name: "createRewardsVault",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "distributor",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "stakingToken",
        type: "address",
      },
    ],
    name: "getVault",
    outputs: [
      {
        internalType: "address",
        name: "vault",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "stakingToken",
        type: "address",
      },
    ],
    name: "predictRewardsVaultAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
