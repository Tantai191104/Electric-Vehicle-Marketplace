import Banner from "./components/Banner";
import Banner2 from "./components/Banner2";
import EVAccessoryGrid from "./components/EVAccessoryGrid";
import EVCategoryCards from "./components/EVCategoryCards";
import EVGuideCards from "./components/EVGuideCards";
import EVProductGrid from "./components/EVProductGrid";

export default function HomePage() {
  return (
    <div className="pt-24"> {/* Thêm padding-top, nếu header cao hơn thì tăng giá trị */}
      <EVCategoryCards />
      <EVProductGrid />
      <Banner />
      <EVAccessoryGrid />
      <Banner2/>
      <EVGuideCards/>
    </div>
  );
}
