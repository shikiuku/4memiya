'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Button } from '@/components/ui/button';

interface Props { }

export function ProductSearch({ }: Props) {
    const searchParams = useSearchParams();
    const { replace } = useRouter();
    const [isPending, startTransition] = useTransition();
    const [term, setTerm] = React.useState(searchParams.get('q')?.toString() || '');

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        params.delete('page'); // Reset page

        startTransition(() => {
            replace(`/?${params.toString()}`, { scroll: false });
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="flex flex-row gap-2 items-center">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                    placeholder="キーワードやIDNo.で検索"
                    className="pl-10 w-[200px] md:w-[300px]"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>
            <Button
                onClick={handleSearch}
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
                {isPending ? '検索中...' : '検索'}
            </Button>
        </div>
    );
}
