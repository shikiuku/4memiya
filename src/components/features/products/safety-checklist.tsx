import { Circle, X } from 'lucide-react';

export function SafetyChecklist() {
    return (
        <div className="space-y-4">
            {/* Safe Items */}
            <div className="space-y-3">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full border-2 border-[#007bff] flex items-center justify-center shrink-0">
                        <Circle className="w-3 h-3 text-[#007bff] fill-[#007bff]" />
                    </div>
                    <p className="text-sm text-slate-700 leading-snug">
                        取引実績が多数あり、X上のやり取りをベースに丁寧に対応します。
                    </p>
                </div>
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full border-2 border-[#007bff] flex items-center justify-center shrink-0">
                        <Circle className="w-3 h-3 text-[#007bff] fill-[#007bff]" />
                    </div>
                    <p className="text-sm text-slate-700 leading-snug">
                        初めての方にも、DMで一つずつ手順を案内するので迷うことがありません。
                    </p>
                </div>
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full border-2 border-[#007bff] flex items-center justify-center shrink-0">
                        <Circle className="w-3 h-3 text-[#007bff] fill-[#007bff]" />
                    </div>
                    <p className="text-sm text-slate-700 leading-snug">
                        支払い方法や受け渡し方法は、相談しながら無理のない形で決めていきます。
                    </p>
                </div>
            </div>

            {/* Warning Items */}
            <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                    <X className="w-6 h-6 text-red-500 shrink-0" />
                    <p className="text-sm text-slate-700 leading-snug">
                        同じアカウントを複数の人に販売するような二重譲渡は行いません。
                    </p>
                </div>
                <div className="flex items-start gap-3">
                    <X className="w-6 h-6 text-red-500 shrink-0" />
                    <p className="text-sm text-slate-700 leading-snug">
                        受け渡し後にパスワードを変更してアカウントを取り戻すような行為は行いません。
                    </p>
                </div>
                <div className="flex items-start gap-3">
                    <X className="w-6 h-6 text-red-500 shrink-0" />
                    <p className="text-sm text-slate-700 leading-snug">
                        不安をあおるような強引な勧誘・決済方法の押しつけは行いません。
                    </p>
                </div>
            </div>
        </div>
    );
}
