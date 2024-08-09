import { MUBAI_FTO_PAIR_ABI } from "@/lib/abis/ftoPair";
import { chains, chainsMap } from "@/lib/chain";
import { exec } from "@/lib/contract";
import { pg } from "@/lib/db";
import { wallet } from "@/services/wallet";
import { Contract, ethers, providers } from "ethers";
import { getContract } from "viem";
import { record } from "zod";

const super_api_key = process.env.FTO_API_KEY ?? "";

const fto_api_key_list = [
  "b3a3a02a-a665-4fb5-bb17-153d05863efe", //bera boyz
];

export const ftoService = {
  createFtoProject: async (data: {
    pair: string;
    provider: string;
    chain_id: number;
    creator_api_key: string;
  }) => {
    if (
      !fto_api_key_list.includes(data.creator_api_key) &&
      data.creator_api_key !== super_api_key
    ) {
      return;
    }

    await pg`INSERT INTO fto_project ${pg({
      pair: data.pair.toLowerCase(),
      provider: data.provider.toLowerCase(),
      chain_id: data.chain_id,
      creator_api_key: data.creator_api_key,
    })}`;
  },
  getProjectInfo: async (data: {
    pair: string;
    chain_id: number;
    creator_api_key: string;
  }) => {
    if (
      !fto_api_key_list.includes(data.creator_api_key) &&
      data.creator_api_key !== super_api_key
    ) {
      return null;
    }

    let output;
    output = await selectFtoProject(data);

    if (!output || !output[0]) {
      const pairContract = new Contract(
        data.pair as `0x${string}`,
        MUBAI_FTO_PAIR_ABI,
        new providers.JsonRpcProvider(
          chainsMap[data.chain_id].rpcUrls.default.http.toString()
        )
      );

      const provider = await pairContract.launchedTokenProvider();

      await createFtoProject({
        pair: data.pair,
        chain_id: data.chain_id,
        provider: provider,
        creator_api_key: data.creator_api_key,
      });
      output = await selectFtoProject(data);
    }
    return output?.[0] ?? null;
  },
  getFtoProjectsByAccount: async ({
    provider,
    chain_id,
  }: {
    provider: string;
    chain_id: number;
  }) => {
    return pg`SELECT * FROM fto_project WHERE provider = ${provider.toLowerCase()} and chain_id = ${chain_id} order by id desc`;
  },
  createOrUpdateProjectInfo: async (data: {
    twitter?: string;
    telegram?: string;
    website?: string;
    description?: string;
    projectName?: string;
    pair: string;
    chain_id: number;
    creator_api_key: string;
  }) => {
    if (
      !fto_api_key_list.includes(data.creator_api_key) &&
      data.creator_api_key.toLowerCase() != super_api_key.toLowerCase()
    ) {
      return false;
    }
    return await updateFtoProject(data);
  },
  createOrUpdateProjectVotes: async (data: {
    project_pair: string;
    wallet_address: string;
    vote: string;
  }) => {
    await pg`INSERT INTO fto_project_vote ${pg({
      project_pair: data.project_pair.toLowerCase(),
      wallet_address: data.wallet_address.toLowerCase(),
      vote: data.vote,
    })} ON CONFLICT (wallet_address, project_pair) DO UPDATE SET vote = ${
      data.vote
    }`;
  },

  updateFtoLogo: async (data: {
    logo_url: string;
    pair: string;
    chain_id: number;
    creator_api_key: string;
  }) => {
    if (
      !fto_api_key_list.includes(data.creator_api_key) &&
      data.creator_api_key.toLowerCase() != super_api_key.toLowerCase()
    ) {
      return;
    }

    await pg`INSERT INTO fto_project ${pg({
      pair: data.pair.toLowerCase(),
      chain_id: data.chain_id,
      logo_url: data.logo_url,
    })}
    ON CONFLICT (pair, chain_id) DO UPDATE SET logo_url = ${data.logo_url}`;
  },
  getProjectVotes: async (data: {
    pair: string;
  }): Promise<{
    rocket_count: number;
    fire_count: number;
    poo_count: number;
    flag_count: number;
  }> => {
    const res = await pg`SELECT 
    COUNT(CASE WHEN vote = 'rocket' THEN 1 END) AS rocket_count,
    COUNT(CASE WHEN vote = 'fire' THEN 1 END) AS fire_count,
    COUNT(CASE WHEN vote = 'poo' THEN 1 END) AS poo_count,
    COUNT(CASE WHEN vote = 'flag' THEN 1 END) AS flag_count
    FROM public.fto_project_vote
    WHERE project_pair = ${data.pair.toLowerCase()};
  `;
    Object.entries(res[0]).forEach(([key, value]) => {
      res[0][key] = Number(value);
    });

    const outdata = res[0];
    return outdata as any;
  },
};

const createFtoProject = async (data: {
  pair: string;
  chain_id: number;
  provider?: string;
  creator_api_key: string;
}) => {
  await pg`INSERT INTO fto_project ${pg({
    pair: data.pair.toLowerCase(),
    provider: data.provider?.toLowerCase() ?? "",
    chain_id: data.chain_id,
    creator_api_key: data.creator_api_key,
  })}`;
};

const updateFtoProject = async (data: {
  twitter?: string;
  telegram?: string;
  website?: string;
  description?: string;
  projectName?: string;
  pair: string;
  chain_id: number;
  creator_api_key: string;
}) => {
  try {
    await pg`INSERT INTO fto_project ${pg({
      twitter: data.twitter ?? "",
      telegram: data.telegram ?? "",
      website: data.website ?? "",
      description: data.description ?? "",
      name: data.projectName,
      pair: data.pair.toLowerCase(),
      chain_id: data.chain_id,
      creator_api_key: data.creator_api_key,
    })}
   ON CONFLICT (pair, chain_id) DO UPDATE SET twitter = ${
     data.twitter ?? ""
   }, telegram = ${data.telegram ?? ""}, website = ${
      data.website ?? ""
    }, description = ${data.description ?? ""}, name = ${
      data.projectName ?? "Unknown"
    }
  WHERE fto_project.creator_api_key = EXCLUDED.creator_api_key OR EXCLUDED.creator_api_key = ${super_api_key};
 `;

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

const selectFtoProject = async (data: { pair: string; chain_id: number }) => {
  return await pg<
    {
      twitter: string;
      telegram: string;
      website: string;
      description: string;
      logo_url: string;
      name: string;
      provider: string;
    }[]
  >`SELECT twitter,logo_url, telegram, website,description,name, provider  FROM fto_project WHERE pair = ${data.pair.toLowerCase()} and chain_id = ${
    data.chain_id
  }`;
};
