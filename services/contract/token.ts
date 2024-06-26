
import BigNumber from 'bignumber.js'
import { BaseContract } from '.'
import { wallet } from '../wallet'
import { makeAutoObservable } from 'mobx'
import { getContract } from 'viem';
import { ContractWrite } from '../utils'
import { amountFormatted } from '@/lib/format'
import { ERC20ABI } from '@/lib/abis/erc20';
import { faucetABI } from '@/lib/abis/faucet';

export class Token implements BaseContract {
  address: string = ''
  name: string = ''
  balanceWithoutDecimals = new BigNumber(0)
  totalSupplyWithoutDecimals = new BigNumber(0)
  symbol: string = ''
  decimals: number = 0
  logoURI = ''
  abi = ERC20ABI
  faucetLoading = false
  isInit = false
  
  
  get displayName () {
    return this.symbol || this.name
  }
  get faucetContract () {
    return  getContract({
      address: this.address as `0x${string}`,
      abi: faucetABI,
      client: { public: wallet.publicClient, wallet: wallet.walletClient }
    })
  }
  get contract () {
    return getContract({
      address: this.address  as `0x${string}`,
      abi: this.abi,
      client: { public: wallet.publicClient, wallet: wallet.walletClient }
    })
  }

  constructor({ balance, ...args }: Partial<Token>) {
    Object.assign(this, args)
    if (balance) {
      this.balanceWithoutDecimals = new BigNumber(balance)
    }
    makeAutoObservable(this)
  }

  get faucet () {
    return new ContractWrite(this.faucetContract.write?.faucet, {
      successMsg: 'Get faucet successfully',

    })
  } 
  get approve () {
    return  new ContractWrite(this.contract.write?.approve, {
      successMsg: 'Approved successfully',
    })
  }

  async init (options?: {loadName?: boolean, loadSymbol?: boolean, loadDecimals?: boolean, loadBalance?: boolean, loadTotalSupply?: boolean}) {
    const loadName = options?.loadName ?? true
    const loadSymbol = options?.loadSymbol ?? true
    const loadDecimals = options?.loadDecimals ?? true
    const loadBalance = options?.loadBalance ?? true
    const loadTotalSupply = options?.loadTotalSupply ?? false
    await Promise.all([
      (loadName && !this.name ) ? this.contract.read.name().then((name) => {
        this.name = name
      }): Promise.resolve(),
      (loadSymbol && !this.symbol) ? this.contract.read.symbol().then((symbol) => {
        this.symbol = symbol
      }): Promise.resolve(),
      (loadDecimals && !this.decimals) ? this.contract.read.decimals().then((decimals) => {
        this.decimals = decimals
      }): Promise.resolve(),
      loadBalance ? this.getBalance() : Promise.resolve(),
      loadTotalSupply ? this.getTotalSupply(): Promise.resolve()
    ])
    this.isInit = true
  }

  async approveIfNoAllowance({amount, spender}:{ amount: string, spender: string}) {
    const allowance = await this.contract.read.allowance([wallet.account as `0x${string}`, spender as `0x${string}`])
    if (new BigNumber(allowance.toString()).isGreaterThanOrEqualTo(new BigNumber(amount))) {
      return
    }
    await this.approve.call([spender as `0x${string}`, BigInt(amount)])
  }


  async getBalance() {
    const balance = await this.contract.read.balanceOf([wallet.account as `0x${string}`])
    this.balanceWithoutDecimals = new BigNumber(balance.toString())
    return this.balanceWithoutDecimals
  }
  async getTotalSupply() {
    const totalSupply = await this.contract.read.totalSupply()
    this.totalSupplyWithoutDecimals = new BigNumber(totalSupply.toString())
    return this.totalSupplyWithoutDecimals
  }


  get balance () {
    return this.balanceWithoutDecimals.div(new BigNumber(10).pow(this.decimals))
  }

  get balanceFormatted() {
    return amountFormatted(this.balanceWithoutDecimals,  {
      decimals: this.decimals,
      fixed: 3
    })
  }
}
