type SpecItem = {
    label: string;
    value: string | number;
};

type SpecListProps = {
    specs: SpecItem[];
};

export function SpecList({ specs }: SpecListProps) {
    return (
        <div className="bg-white">
            {specs.map((spec, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-dashed border-slate-200 last:border-0">
                    <span className="text-sm text-slate-500 font-medium">{spec.label}</span>
                    <span className="text-sm text-slate-900 font-bold">{spec.value}</span>
                </div>
            ))}
        </div>
    );
}
