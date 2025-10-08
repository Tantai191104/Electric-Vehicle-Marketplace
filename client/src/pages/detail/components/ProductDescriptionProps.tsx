interface ProductDescriptionProps {
    description: string;
    className?: string;
}

export function ProductDescription({ description, className = "" }: ProductDescriptionProps) {
    if (!description) return null;
    
    return (
        <div className={`bg-blue-50 rounded-xl p-4 ${className}`}>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Mô tả sản phẩm</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
        </div>
    );
}