import Banner from "./components/Banner";
import Banner2 from "./components/Banner2";
import EVBatteryGrid from "./components/EVBatteryGrid";
import EVCategoryCards from "./components/EVCategoryCards";
import EVGuideCards from "./components/EVGuideCards";
import EVProductGrid from "./components/EVProductGrid";

export default function HomePage() {
  return (
    <div className="mt-[80px]">
      <EVCategoryCards />
      <EVProductGrid />
      <Banner />
      <EVBatteryGrid />
      <Banner2 />
      <EVGuideCards />
    </div>
  );
}
