import { useQuery } from "@apollo/client";
import {
  GetPot2PumpByLaunchTokenDocument,
  GetPot2PumpByLaunchTokenQuery,
  GetPot2PumpByLaunchTokenQueryVariables,
} from "@/lib/algebra/graphql/generated/graphql";
import { pot2PumpToMemePair } from "../algebra/graphql/clients/pair";
import { Pot2Pump } from "../algebra/graphql/generated/graphql";

export const useLaunchTokenQuery = (launchTokenAddress: string) =>
  useQuery<
    GetPot2PumpByLaunchTokenQuery,
    GetPot2PumpByLaunchTokenQueryVariables
  >(GetPot2PumpByLaunchTokenDocument, {
    variables: { launchToken: launchTokenAddress?.toLowerCase() },
    fetchPolicy: "network-only",
    skip: !launchTokenAddress,
    onCompleted: (data: GetPot2PumpByLaunchTokenQuery) => {
      if (!data?.pot2Pumps?.[0]) return null;
      return pot2PumpToMemePair(data.pot2Pumps[0] as Partial<Pot2Pump>);
    },
  });
