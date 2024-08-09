import { Token } from "@/services/contract/token";
import TokenLogo from "../TokenLogo/TokenLogo";
import { Copy } from "../copy";
import { observer } from "mobx-react-lite";
import CardContianer from "../CardContianer/CardContianer";
import { PairContract } from "@/services/contract/pair-contract";
import PopUp from "../PopUp/PopUp";
import { Button } from "../button";
import { liquidity } from "@/services/liquidity";
import { RemoveLiquidity } from "../LPCard";

interface PoolLiquidityCardProps {
  pair: PairContract;
  autoSize?: boolean;
}

export const PoolLiquidityCard = observer(
  ({ pair, autoSize }: PoolLiquidityCardProps) => {
    return (
      <CardContianer autoSize={autoSize}>
        {" "}
        <div className="flex w-full flex-col lg:flex-row  gap-[0.5rem]">
          <div className="flex flex-1 flex-col lg:flex-row justify-between align-middle items-center gap-[0.5rem]">
            <div className="flex mr-5">
              <div className="flex mr-2 items-center">
                <TokenLogo token={pair.token0} />
                <TokenLogo token={pair.token1} />
              </div>
              <p className="w-[10rem]">
                {pair.token0.symbol} / {pair.token1.symbol}
              </p>
            </div>
            <div className="flex-1">
              <div>
                <span>Your Liquidity: </span>
                {pair.myLiquidityDisplay}
              </div>
              <div>
                <span>Total Liquidity: </span>
                {pair.liquidityDisplay}
              </div>
            </div>
          </div>{" "}
          <div className="flex lg:justify-end">
            <PopUp
              info="normal"
              trigger={
                <Button
                  onPress={(e) => {
                    liquidity.setCurrentRemovePair(pair);
                  }}
                >
                  Remove LP
                </Button>
              }
              contents={<RemoveLiquidity noCancelButton></RemoveLiquidity>}
            />
          </div>
        </div>
      </CardContianer>
    );
  }
);

export default PoolLiquidityCard;
