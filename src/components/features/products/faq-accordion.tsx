import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

export function FAQAccordion() {
    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm font-bold text-slate-800">支払い方法は何がありますか？</AccordionTrigger>
                <AccordionContent className="text-sm text-slate-600 space-y-2">
                    <p>現在はXのDMにてご相談いただいたあと、</p>
                    <ul className="list-disc pl-5">
                        <li>PayPay</li>
                        <li>銀行振込</li>
                        <li>コンビニ払い(セブン/ローソン)</li>
                    </ul>
                    <p>などからご案内します。詳細はDMで個別にお伝えします。</p>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger className="text-sm font-bold text-slate-800">アカウント引き継ぎの手順が不安です。</AccordionTrigger>
                <AccordionContent className="text-sm text-slate-600">
                    ご安心ください。引き継ぎ方法は丁寧にサポートいたします。
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger className="text-sm font-bold text-slate-800">BAN（利用停止）の心配はありませんか？</AccordionTrigger>
                <AccordionContent className="text-sm text-slate-600">
                    これまでにBANの報告はありませんが、ゲームの規約上リスクがゼロではないことをご理解ください。
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
                <AccordionTrigger className="text-sm font-bold text-slate-800">購入前に質問だけすることはできますか？</AccordionTrigger>
                <AccordionContent className="text-sm text-slate-600">
                    はい、もちろん可能です。些細なことでもお気軽にDMください。
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
