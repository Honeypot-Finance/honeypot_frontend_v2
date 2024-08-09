import { Token } from "@/services/contract/token";
import TokenLogo from "../TokenLogo/TokenLogo";
import { Copy } from "../copy";
import { observer } from "mobx-react-lite";
import CardContianer from "../CardContianer/CardContianer";
import { useEffect } from "react";
import { Button } from "@nextui-org/react";
import { WatchAsset } from "../atoms/WatchAsset/WatchAsset";
import { BiWallet } from "react-icons/bi";
import {
  OptionsDropdown,
  optionsPresets,
} from "../OptionsDropdown/OptionsDropdown";
import { shareMediaToast } from "../ShareSocialMedialPopUp/ShareSocialMedialPopUp";
interface TokenBalanceCardProps {
  token: Token;
  autoSize?: boolean;
}

export const TokenBalanceCard = observer(
  ({ token, autoSize }: TokenBalanceCardProps) => {
    useEffect(() => {
      token.isInit || token.init();
    }, []);
    return (
      <CardContianer autoSize={autoSize}>
        <TokenLogo token={token}></TokenLogo>
        <div className="flex-1 flex items-center">
          {token.name} ({token.symbol})
          <OptionsDropdown
            className="min-h-0 h-[unset]"
            options={[
              optionsPresets.copy({
                copyText: token?.address ?? "",
                displayText: "Copy Token address",
                copysSuccessText: "Token address copied",
              }),
              {
                icon: <BiWallet />,
                display: "Import token to wallet",
                onClick: () => {
                  token.watch();
                },
              },
            ]}
          />
        </div>
        <div className="">{token.balanceFormatted}</div>
      </CardContianer>
    );
  }
);

export default TokenBalanceCard;
