import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { FiEdit3, FiUser, FiMapPin } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export interface ShippingInfo {
    fullName: string;
    phone: string;
    email: string;
    houseNumber: string;
    city: string;
    district: string;
    ward: string;
    note?: string;
}
interface ShippingInfoStepProps {
    shippingInfo: ShippingInfo;
    onUpdate: (info: ShippingInfo) => void;
    className?: string;
}

interface SelectOption {
    value: string;
    label: string;
}

const cities: SelectOption[] = [
    { value: "", label: "Chọn tỉnh/thành phố" },
    { value: "ho-chi-minh", label: "TP. Hồ Chí Minh" },
    { value: "ha-noi", label: "Hà Nội" },
    { value: "da-nang", label: "Đà Nẵng" }
];

const districts: SelectOption[] = [
    { value: "", label: "Chọn quận/huyện" },
    { value: "quan-1", label: "Quận 1" },
    { value: "quan-3", label: "Quận 3" },
    { value: "quan-7", label: "Quận 7" }
];

const wards: SelectOption[] = [
    { value: "", label: "Chọn phường/xã" },
    { value: "ben-nghe", label: "Phường Bến Nghé" },
    { value: "ben-thanh", label: "Phường Bến Thành" }
];

export const ShippingInfoStep: React.FC<ShippingInfoStepProps> = ({
    shippingInfo,
    onUpdate,
    className = ""
}) => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<ShippingInfo>(shippingInfo);

    // Initialize with user data from system
    useEffect(() => {
        if (user) {
            const userBasedShippingInfo: ShippingInfo = {
                fullName: user.profile?.fullName || user.name || '',
                phone: user.phone || '',
                email: user.email || '',
                houseNumber: user.profile?.address?.houseNumber || '123 Đường Lê Lợi',
                city: user.profile?.address?.province || 'TP. Hồ Chí Minh',
                district: user.profile?.address?.district || 'Quận 1',
                ward: user.profile?.address?.ward || 'Phường Bến Nghé',
                note: ''
            };
            setFormData(userBasedShippingInfo);
            onUpdate(userBasedShippingInfo);
        }
    }, [user, onUpdate]);

    const handleNoteChange = (value: string) => {
        const updated = { ...formData, note: value };
        setFormData(updated);
        onUpdate(updated);
    };

    const handleEditProfile = () => {
        navigate('/profile?tab=address');
    };

    const InfoDisplay = ({
        label,
        value,
        icon
    }: {
        label: string;
        value: string;
        icon: React.ReactNode;
    }) => (
        <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-sm font-medium text-gray-600">{label}</span>
            </div>
            <div className="font-semibold text-gray-900">{value}</div>
        </div>
    );

    return (
        <div className={className}>
            <div className="space-y-6">
                {/* Header with edit button */}
                <div className="flex items-center justify-between bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div>
                        <h3 className="font-semibold text-blue-900">Thông tin giao hàng</h3>
                        <p className="text-sm text-blue-700">Sử dụng thông tin từ hồ sơ của bạn</p>
                    </div>
                    <Button
                        onClick={handleEditProfile}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                        <FiEdit3 className="w-4 h-4" />
                        Sửa hồ sơ
                    </Button>
                </div>

                {/* Display user information (read-only) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoDisplay
                        label="Họ và tên"
                        value={formData.fullName}
                        icon={<FiUser className="w-4 h-4 text-blue-600" />}
                    />

                    <InfoDisplay
                        label="Số điện thoại"
                        value={formData.phone}
                        icon={<FiUser className="w-4 h-4 text-blue-600" />}
                    />

                    <div className="md:col-span-2">
                        <InfoDisplay
                            label="Email"
                            value={formData.email}
                            icon={<FiUser className="w-4 h-4 text-blue-600" />}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <InfoDisplay
                            label="Địa chỉ giao hàng"
                            value={user?.profile?.address ?
                                `${user.profile.address.houseNumber || formData.houseNumber}, ${user.profile.address.ward || getWardLabel(formData.ward)}, ${user.profile.address.district || getDistrictLabel(formData.district)}, ${user.profile.address.province || getCityLabel(formData.city)}` :
                                `${formData.houseNumber}, ${getWardLabel(formData.ward)}, ${getDistrictLabel(formData.district)}, ${getCityLabel(formData.city)}`
                            }
                            icon={<FiMapPin className="w-4 h-4 text-blue-600" />}
                        />
                    </div>
                </div>

                {/* Only note field is editable */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ghi chú giao hàng (tùy chọn)
                    </label>
                    <textarea
                        value={formData.note || ''}
                        onChange={(e) => handleNoteChange(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Ghi chú đặc biệt cho việc giao hàng..."
                    />
                </div>

                {/* Info banner */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">!</span>
                        </div>
                        <div>
                            <p className="text-sm text-yellow-800">
                                <strong>Lưu ý:</strong> Để thay đổi thông tin cá nhân và địa chỉ giao hàng,
                                vui lòng cập nhật trong phần <strong>Hồ sơ</strong> của bạn.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Helper functions to get labels
    function getCityLabel(value: string): string {
        return cities.find(city => city.value === value)?.label || value;
    }

    function getDistrictLabel(value: string): string {
        return districts.find(district => district.value === value)?.label || value;
    }

    function getWardLabel(value: string): string {
        return wards.find(ward => ward.value === value)?.label || value;
    }
};