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
                        取引実績多数。X（旧Twitter）でのやり取りを基本に、丁寧に対応します。
                    </p>
                </div>
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full border-2 border-[#007bff] flex items-center justify-center shrink-0">
                        <Circle className="w-3 h-3 text-[#007bff] fill-[#007bff]" />
                    </div>
                    <p className="text-sm text-slate-700 leading-snug">
                        初めての方でも安心。DMで手順を一つずつ案内します。
                    </p>
                </div>
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full border-2 border-[#007bff] flex items-center justify-center shrink-0">
                        <Circle className="w-3 h-3 text-[#007bff] fill-[#007bff]" />
                    </div>
                    <p className="text-sm text-slate-700 leading-snug">
                        支払い方法・受け渡し方法は、相談しながら無理のない形で決定します。
                    </p>
                </div>
            </div>

            {/* Warning Items */}
            <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                    <X className="w-6 h-6 text-red-500 shrink-0" />
                    <p className="text-sm text-slate-700 leading-snug">
                        同一アカウントを複数人に販売する「二重譲渡」は一切行いません。
                    </p>
                </div>
                <div className="flex items-start gap-3">
                    <X className="w-6 h-6 text-red-500 shrink-0" />
                    <p className="text-sm text-slate-700 leading-snug">
                        受け渡し後にパスワードを変更し、アカウントを取り戻す行為は行いません。
                    </p>
                </div>
                <div className="flex items-start gap-3">
                    <X className="w-6 h-6 text-red-500 shrink-0" />
                    <p className="text-sm text-slate-700 leading-snug">
                        不安をあおる強引な勧誘や、決済方法の押しつけはありません。
                    </p>
                </div>
            </div>
        </div>
    );
}
