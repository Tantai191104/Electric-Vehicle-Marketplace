import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Banner from "./components/Banner";
import Banner2 from "./components/Banner2";
import EVBatteryGrid from "./components/EVBatteryGrid";
import EVCategoryCards from "./components/EVCategoryCards";
import EVGuideCards from "./components/EVGuideCards";
import EVProductGrid from "./components/EVProductGrid";

export default function HomePage() {
  const [selected, setSelected] = useState<string>("car");
  const [searchParams] = useSearchParams();
  const productRef = useRef<HTMLDivElement>(null);
  const batteryRef = useRef<HTMLDivElement>(null);

  // Get search params from URL
  const searchQuery = searchParams.get("search") || undefined;
  const location = searchParams.get("location") || undefined;
  const category = searchParams.get("category") || undefined;

  // Chỉ pass search/location cho grid được chọn trong category
  // Grid còn lại hiển thị dữ liệu bình thường (không filter)
  const vehicleSearch = category === "vehicle" ? searchQuery : undefined;
  const batterySearch = category === "battery" ? searchQuery : undefined;
  const vehicleLocation = category === "vehicle" ? location : undefined;
  const batteryLocation = category === "battery" ? location : undefined;

  // Debug log
  useEffect(() => {
    console.log("Search params:", { searchQuery, location, category });
    console.log("Vehicle props:", { search: vehicleSearch, location: vehicleLocation });
    console.log("Battery props:", { search: batterySearch, location: batteryLocation });
  }, [searchQuery, location, category, vehicleSearch, batterySearch, vehicleLocation, batteryLocation]);

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

      {/* Luôn hiển thị xe điện */}
      <div id="cars" ref={productRef}>
        <EVProductGrid search={vehicleSearch} location={vehicleLocation} />
      </div>

      {/* Luôn hiển thị banner */}
      <Banner />

      {/* Luôn hiển thị pin */}
      <div id="batteries" ref={batteryRef}>
        <EVBatteryGrid search={batterySearch} location={batteryLocation} />
      </div>

      {/* Luôn hiển thị banner và guide */}
      <Banner2 />
      <EVGuideCards />
    </div>
  );
}
