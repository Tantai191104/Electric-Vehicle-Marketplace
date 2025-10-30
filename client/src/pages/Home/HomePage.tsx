import { useEffect, useRef, useState } from "react";
import Banner from "./components/Banner";
import Banner2 from "./components/Banner2";
import EVBatteryGrid from "./components/EVBatteryGrid";
import EVCategoryCards from "./components/EVCategoryCards";
import EVGuideCards from "./components/EVGuideCards";
import EVProductGrid from "./components/EVProductGrid";

export default function HomePage() {
  const [selected, setSelected] = useState<string>("car");
  const productRef = useRef<HTMLDivElement>(null);
  const batteryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected === "charger") {
      batteryRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      productRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selected]);

  return (
    <div className="mt-[80px]">
      <EVCategoryCards selected={selected} onSelect={setSelected} />

      <div id="cars" ref={productRef}>
        <EVProductGrid />
      </div>

      <Banner />

      <div id="batteries" ref={batteryRef}>
        <EVBatteryGrid />
      </div>

      <Banner2 />
      <EVGuideCards />
    </div>
  );
}
