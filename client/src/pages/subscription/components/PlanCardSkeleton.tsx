export const PlanCardSkeleton: React.FC = () => {
    return (
        <div className="h-full rounded-2xl border-2 border-slate-200 bg-white shadow-sm p-8 animate-pulse">
            <div className="h-8 bg-slate-200 rounded-lg w-2/3 mb-3" />
            <div className="h-4 bg-slate-100 rounded w-full mb-8" />
            <div className="h-16 bg-slate-100 rounded-lg mb-8" />
            <div className="h-12 bg-slate-200 rounded-xl mb-8" />
            <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-slate-100 rounded-full" />
                        <div className="h-4 bg-slate-100 rounded flex-1" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlanCardSkeleton;
