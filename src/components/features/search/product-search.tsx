'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface Props { }

export function ProductSearch({ }: Props) {
    const searchParams = useSearchParams();
    const { replace } = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        params.delete('page'); // Reset page

        startTransition(() => {
            replace(`/?${params.toString()}`);
        });
    }, 300);

    return (
        <div className="flex flex-col gap-3 items-end">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                    placeholder="キーワードで検索"
                    className="pl-10 w-[280px] md:w-[300px]"
                    onChange={(e) => handleSearch(e.target.value)}
                    defaultValue={searchParams.get('q')?.toString()}
                />
                {isPending && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
