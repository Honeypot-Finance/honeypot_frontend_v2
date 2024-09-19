import { FtoPairContract } from "@/services/contract/ftopair-contract";
import { MemePairContract } from "@/services/contract/memepair-contract";
import { observer, useLocalObservable } from "mobx-react-lite";
import LoadingDisplay from "../LoadingDisplay/LoadingDisplay";
import { useEffect } from "react";
import { Button } from "../button";
import { wallet } from "@/services/wallet";
import { BerachainRewardsVaultContract } from "@/services/contract/berachain-vault-contract";

interface VaultCardProps {
  pair: FtoPairContract | MemePairContract;
}

export const VaultCard = observer((props: VaultCardProps) => {
  const state = useLocalObservable<{
    isInit: boolean;
    isPair: boolean;
    isVault: boolean;
    launchPair: FtoPairContract | MemePairContract;
    poolPairAddress: string | undefined;
    vaultAddress: string | undefined;
  }>(() => ({
    isInit: false,
    isPair: false,
    isVault: false,
    launchPair: props.pair,
    poolPairAddress: undefined,
    vaultAddress: undefined,
  }));

  useEffect(() => {
    const initModal = async () => {
      const poolPair = await props.pair.getPoolPair();
      if (!poolPair) return;
      state.isPair = true;
      state.poolPairAddress = poolPair.address;

      await getVaultAddress();
      if (!state.vaultAddress) return;
      const vaultContract = new BerachainRewardsVaultContract({
        address: state.vaultAddress,
      });
      vaultContract.contract.read.distributor().then((res) => {
        console.log("distributor", res);
      });
    };

    initModal().then(() => {
      state.isInit = true;
    });
  }, []);

  const getVaultAddress = async () => {
    const vaultAddress = await wallet.contracts.vaultFactory?.getVault(
      state.poolPairAddress as `0x${string}`
    );
    state.isVault = true;
    state.vaultAddress = vaultAddress;
  };

  return (
    <div>
      {state.isInit ? (
        state.isPair ? (
          <div>
            <h1>VaultCard</h1>
            <p>poolAddress: {state.poolPairAddress}</p>
            {state.isVault ? (
              <p>vaultAddress: {state.vaultAddress}</p>
            ) : (
              <Button
                onClick={() => {
                  console.log("createVault");
                  wallet.contracts.vaultFactory?.createVault
                    .call([state.poolPairAddress as `0x${string}`])
                    .then((res) => {
                      getVaultAddress();
                    });
                }}
              >
                Create Vault
              </Button>
            )}
          </div>
        ) : (
          <div>
            <p>This project does not have pool yet</p>
          </div>
        )
      ) : (
        <LoadingDisplay />
      )}
    </div>
  );
});

export default VaultCard;
