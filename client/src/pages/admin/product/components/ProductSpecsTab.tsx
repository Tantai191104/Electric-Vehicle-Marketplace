import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/types/productType";

interface Props {
  product: Product;
}

export const ProductSpecsTab: React.FC<Props> = ({ product }) => {
  const formatSpecLabelAndUnit = (key: string, value: string) => {
    const specConfig: Record<string, { label: string; unit?: string }> = {
      batteryCapacity: { label: "Dung lượng pin", unit: "Ah" },
      range: { label: "Phạm vi hoạt động", unit: "km" },
      chargingTime: { label: "Thời gian sạc", unit: "giờ" },
      power: { label: "Công suất", unit: "W" },
      maxSpeed: { label: "Tốc độ tối đa", unit: "km/h" },
      motorType: { label: "Loại động cơ" },
      batteryType: { label: "Loại pin" },
      voltage: { label: "Điện áp", unit: "V" },
      warranty: { label: "Bảo hành", unit: "tháng" },
      compatibility: { label: "Tương thích" },
      cycleLife: { label: "Chu kỳ sống", unit: "lần" },
      operatingTemperature: { label: "Nhiệt độ hoạt động", unit: "°C" },
      dimensions: { label: "Kích thước", unit: "mm" },
      capacity: { label: "Dung lượng", unit: "L" },
      weight: { label: "Trọng lượng", unit: "kg" },
      efficiency: { label: "Hiệu suất", unit: "%" },
      current: { label: "Dòng điện", unit: "A" },
      material: { label: "Chất liệu" },
      waterproof: { label: "Chống nước", unit: "IP" },
    };

    const config = specConfig[key] || {
      label: key.replace(/([A-Z])/g, ' $1').trim()
    };

    return {
      label: config.label,
      value: config.unit ? `${value} ${config.unit}` : value
    };
  };

  return (
    <div className="space-y-4">
      {/* Dimensions */}
      {(product.length || product.width || product.height || product.weight) && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 text-sm">Kích thước & Trọng lượng</h3>
            <div className="space-y-2">
              {product.length && (
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded text-sm">
                  <span className="text-gray-600 font-medium">Chiều dài:</span>
                  <span className="font-semibold text-blue-600">{product.length} mm</span>
                </div>
              )}
              {product.width && (
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded text-sm">
                  <span className="text-gray-600 font-medium">Chiều rộng:</span>
                  <span className="font-semibold text-blue-600">{product.width} mm</span>
                </div>
              )}
              {product.height && (
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded text-sm">
                  <span className="text-gray-600 font-medium">Chiều cao:</span>
                  <span className="font-semibold text-blue-600">{product.height} mm</span>
                </div>
              )}
              {product.weight && (
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded text-sm">
                  <span className="text-gray-600 font-medium">Trọng lượng:</span>
                  <span className="font-semibold text-blue-600">{product.weight} kg</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Specifications */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 text-sm">Thông số kỹ thuật</h3>
            <div className="space-y-2">
              {Object.entries(product.specifications).map(([key, value]) => {
                const { label, value: formattedValue } = formatSpecLabelAndUnit(key, value);
                return (
                  <div key={key} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded text-sm">
                    <span className="text-gray-600 font-medium">{label}:</span>
                    <span className="font-semibold text-green-600 text-right">
                      {formattedValue}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Info */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 text-sm">Thông tin bổ sung</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded">
              <span className="text-gray-600 font-medium">Ngày đăng:</span>
              <span className="font-semibold text-blue-600 text-right">
                {new Date(product.createdAt).toLocaleString('vi-VN')}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 bg-green-50 rounded">
              <span className="text-gray-600 font-medium">Cập nhật lần cuối:</span>
              <span className="font-semibold text-green-600 text-right">
                {new Date(product.updatedAt).toLocaleString('vi-VN')}
              </span>
            </div>
            <div className="flex flex-col py-2 px-3 bg-purple-50 rounded">
              <span className="text-gray-600 font-medium mb-1">ID sản phẩm:</span>
              <span className="font-semibold text-purple-600 font-mono text-xs break-all">
                {product._id}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};