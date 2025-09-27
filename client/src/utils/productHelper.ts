// Helper functions
const getProductType = (category: string) => {
  return category === "vehicle" ? "Xe điện" : "Pin xe điện";
};

const getConditionLabel = (condition: string) => {
  const conditionMap: Record<string, string> = {
    "new": "Mới",
    "used": "Đã sử dụng",
    "refurbished": "Tân trang",
    "like-new": "Như mới"
  };
  return conditionMap[condition] || "Đã sử dụng";
};
export { getProductType, getConditionLabel };