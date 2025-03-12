import Link from "next/link";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Tab, Tabs } from "@nextui-org/react";
import { NextLayoutPage } from "@/types/nextjs";
import { Button } from "@/components/button/v3";
import Pagination from "@/components/Pagination/Pagination";
import { LaunchCardV3 } from "@/components/LaunchCard/v3";
import { Filter } from "@/components/pot2pump/FilterModal";
import { Pot2PumpTracker } from "@/components/MemeWarBanner/Pot2PumpTracker";
import { Pot2PumpPumpingService } from "@/services/launchpad/pot2pump/pumping";
import { WrappedNextInputSearchBar } from "@/components/wrappedNextUI/SearchBar/WrappedInputSearchBar";
import { FilterState } from "@/constants/pot2pump.type";
import { defaultFilterState } from "@/constants/pot2pump";
import HoneyContainer from "@/components/CardContianer/HoneyContainer";
import { hasValue } from "@/lib/utils";
import { PAGE_LIMIT } from "@/services/launchpad";
import { chain } from "@/services/chain";

const MemeLaunchPage: NextLayoutPage = observer(() => {
  const [pumpingProjects, setPumpingProjects] =
    useState<Pot2PumpPumpingService>();
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!chain.isInit) {
      return;
    }
    // launchpad.setCurrentLaunchpadType("meme");
    // launchpad.showNotValidatedPairs = true;
    // launchpad.myLaunches.reloadPage();
    // launchpad.projectsPage.updateFilter({
    //   status: "success",
    // });

    // memewarStore.reloadParticipants();

    const newPumpingProjects = new Pot2PumpPumpingService();
    setPumpingProjects(newPumpingProjects);
    newPumpingProjects.projectsPage.reloadPage();
  }, [chain.isInit]);

  const onChangeFilter = (data: any) => {
    setFilters(data);
  };

  useEffect(() => {
    if (pumpingProjects) {
      console.log("hasValue(filters)", hasValue(filters), filters);
      if (hasValue(filters)) {
        pumpingProjects.projectsPage.updateFilter({
          search: search.length > 0 ? search : undefined,
          currentPage: 0,
          status: "success",
          limit: PAGE_LIMIT,
          hasNextPage: true,
          orderBy: "endTime",
          orderDirection: "desc",
          ...filters,
        });
      } else {
        pumpingProjects.projectsPage.updateFilter({
          search: search.length > 0 ? search : undefined,
          currentPage: 0,
          status: "success",
          limit: PAGE_LIMIT,
          hasNextPage: true,
          orderBy: "endTime",
          orderDirection: "desc",
          ...defaultFilterState,
        });
      }
    }
  }, [filters, pumpingProjects, search]);

  return (
    <div className="w-full grow flex flex-col font-gliker">
      <div className="px-4 md:px-6 w-full xl:max-w-[1200px] mx-auto flex flex-col sm:gap-y-4">
        <HoneyContainer>
          <Pot2PumpTracker />
        </HoneyContainer>

        <div>
          <div
            id="filter"
            className="flex flex-col sm:flex-row items-center gap-2 my-4 sm:my-0"
          >
            <WrappedNextInputSearchBar
              value={search}
              placeholder="Search by token name, symbol or address"
              className="border border-[#FFCD4D] shadow-[1px_2px_0px_0px_#9B7D2F] placeholder:text-xs"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full relative">
          <div className="py-2 sm:py-0 sm:absolute right-0 top-0 flex gap-2">
            <Filter
              filtersList={[
                {
                  key: 0,
                  label: "TVL (USD)",
                  category: "tvl",
                },
                {
                  key: 3,
                  label: "Market cap",
                  category: "marketcap",
                },
                {
                  key: 4,
                  label: "24H txns",
                  category: "daytxns",
                },
                {
                  key: 5,
                  label: "24H buys",
                  category: "daybuys",
                },
                {
                  key: 6,
                  label: "24H sells",
                  category: "daysells",
                },
                {
                  key: 7,
                  label: "24H volume",
                  category: "dayvolume",
                },
                {
                  key: 8,
                  label: "24H change (%)",
                  category: "daychange",
                },
                {
                  key: 9,
                  label: "Raised Token",
                  category: "raiseToken",
                },
              ]}
              filters={filters}
              setFilters={onChangeFilter}
              pumpingProjects={pumpingProjects}
            />
            <Link
              href="/launch-token?launchType=meme"
              className="text-black font-bold"
            >
              <Button className="w-full">Launch Token</Button>
            </Link>
          </div>

          <Tabs
            // destroyInactiveTabPanel={false}
            aria-label="Options"
            classNames={{
              tabList: "bg-transparent",
              tab: "flex flex-col items-center gap-2.5 border-0  backdrop-blur-[100px] p-2.5 rounded-[10px]",
            }}
            className="next-tab"
            onSelectionChange={(key) => {
              if (key === "all") {
                pumpingProjects?.projectsPage.reloadPage();
              }
            }}
          >
            <Tab
              key="all"
              title="All MEMEs"
            >
              {pumpingProjects && (
                <Pagination
                  paginationState={pumpingProjects.projectsPage}
                  render={(pair) => (
                    <LaunchCardV3
                      pair={pair}
                      action={<></>}
                      key={pair.address}
                      type="simple"
                    />
                  )}
                  classNames={{
                    itemsContainer:
                      "grid gap-8 grid-cols-1 md:grid-cols-2 xl:gap-6 xl:grid-cols-3",
                  }}
                />
              )}
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
});

export default MemeLaunchPage;
