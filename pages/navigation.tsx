import NavigationWidget from "@/components/atoms/NavigationWidget/NavigationWidget";
import { Button } from "@/components/button";
import { flatAppPath, flatMenu } from "@/data/allAppPath";
import { useCallback, useRef, useState } from "react";

const filteredMap = (appPath: flatMenu[]) =>
  appPath.filter((path) => path.title != "Navigation");

export default function Navigation() {
  const [paths, setPaths] = useState<flatMenu[]>(filteredMap(flatAppPath));

  const resetWidgetData = useCallback(() => {
    flatAppPath.forEach((path) => {
      localStorage.removeItem(path.title);
    });

    //rerender widgets
    setPaths(
      filteredMap(paths).map((path) => ({ ...path, title: path.title + " " }))
    );
  }, [paths]);

  return (
    <div>
      <div className="flex">
        <Button onClick={resetWidgetData}>Reset Widgets</Button>
      </div>
      <div className="relative w-full h-[80vh] max-h-[80vh] radius border-orange-800/20 border-5 bg-orange-400/20">
        {paths.map((path) => (
          <NavigationWidget
            widgetName={path.title}
            widgetIcon={path.icon}
            link={path.path}
            key={path.title}
          />
        ))}
      </div>
    </div>
  );
}
