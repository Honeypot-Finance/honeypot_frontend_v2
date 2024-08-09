import { StaticImageData } from "next/image";

export type Menu = {
  path:
    | string
    | {
        path: string;
        title: string;
        icon?: StaticImageData;
      }[];
  title: string;
  icon?: StaticImageData;
};

export type flatMenu = {
  path: string;
  title: string;
  icon?: StaticImageData;
};

export const appPathsList: Menu[] = [
  {
    path: "/navigation",
    title: "Navigation",
  },
  {
    path: "/swap",
    title: "Swap",
  },
  {
    path: "/faucet",
    title: "Faucet",
  },
  {
    path: [
      {
        path: "/pools",
        title: "LP Pool List",
      },
      {
        path: "/pool",
        title: "Add Liquidity",
      },
    ],
    title: "Liquidity",
  },
  {
    path: [
      {
        path: "/launch",
        title: "Project List",
      },
      {
        path: "/launch-token",
        title: "Launch Project",
      },
    ],
    title: "Launch",
  },
  {
    path: "/profile",
    title: "Profile",
  },
];

const getFlatPaths = (paths: Menu[]): flatMenu[] => {
  let flatPaths: flatMenu[] = [];

  paths.forEach((path) => {
    if (typeof path.path === "string") {
      flatPaths.push({
        path: path.path,
        title: path.title,
      });
    }
    if (Array.isArray(path.path)) {
      flatPaths = [...flatPaths, ...getFlatPaths(path.path)];
    }
  });

  return flatPaths;
};

export const flatAppPath = getFlatPaths(appPathsList);
