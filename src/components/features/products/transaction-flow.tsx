export function TransactionFlow() {
    return (
        <div className="space-y-4">
            {[
                { step: 1, text: '下のボタンから「購入希望です」とDMを送る' },
                { step: 2, text: '金額と受け渡し方法を確認（質問だけでもOK）' },
                { step: 3, text: 'お支払い後、アカウント情報をお渡し' },
            ].map((item) => (
                <div key={item.step} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#007bff] text-white font-bold text-sm flex items-center justify-center shrink-0 pt-[2px]">
                        {item.step}
                    </div>
                    <p className="text-sm text-slate-700 font-medium">
                        {item.text}
                    </p>
                </div>
            ))}
        </div>
    );
}
