import { authProcedure, publicProcedure, router } from "../trpc";
import z from "zod";
import PQueue from "p-queue";
import { ftoService } from "../service/fto";

const queue = new PQueue({ concurrency: 10 });

const api_key = process.env.FTO_API_KEY ?? "";

export const ftoRouter = router({
  createProject: publicProcedure
    .input(
      z.object({
        chain_id: z.number(),
        pair: z.string(),
        provider: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // const { index } = input;
      await ftoService.createFtoProject({ ...input, creator_api_key: api_key });
    }),
  getProjectInfo: publicProcedure
    .input(
      z.object({
        pair: z.string(),
        chain_id: z.number(),
      })
    )
    .output(
      z
        .object({
          twitter: z.string().or(z.null()),
          telegram: z.string().or(z.null()),
          website: z.string().or(z.null()),
          description: z.string().or(z.null()),
          logo_url: z.string().or(z.null()),
          name: z.string().or(z.null()),
          provider: z.string(),
        })
        .or(z.null())
    )
    .query(async ({ input }) => {
      const info = await ftoService.getProjectInfo({
        ...input,
        creator_api_key: api_key,
      });
      return info;
    }),
  getProjectsByAccount: publicProcedure
    .input(
      z.object({
        provider: z.string(),
        chain_id: z.number(),
      })
    )
    .query(async ({ input }) => {
      return ftoService.getFtoProjectsByAccount(input);
    }),
  createOrUpdateProjectInfo: authProcedure
    .input(
      z.object({
        twitter: z.string(),
        telegram: z.string(),
        website: z.string(),
        description: z.string(),
        projectName: z.string(),
        pair: z.string(),
        chain_id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      await ftoService.createOrUpdateProjectInfo({
        ...input,
        creator_api_key: api_key,
      });
    }),
  updateProjectLogo: authProcedure
    .input(
      z.object({
        logo_url: z.string(),
        pair: z.string(),
        chain_id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      console.log(input);
      await ftoService.updateFtoLogo({
        logo_url: input.logo_url,
        pair: input.pair,
        chain_id: input.chain_id,
        creator_api_key: api_key,
      });
    }),
  createOrUpdateProjectVotes: publicProcedure
    .input(
      z.object({
        project_pair: z.string(),
        wallet_address: z.string(),
        vote: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await ftoService.createOrUpdateProjectVotes(input);
    }),
  getProjectVotes: publicProcedure
    .input(
      z.object({
        pair: z.string(),
      })
    )
    .output(
      z.object({
        rocket_count: z.number(),
        fire_count: z.number(),
        poo_count: z.number(),
        flag_count: z.number(),
      })
    )
    .query(async ({ input }) => {
      return await ftoService.getProjectVotes(input);
    }),
});
