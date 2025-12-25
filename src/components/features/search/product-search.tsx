'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Props { }

export function ProductSearch({ }: Props) {
    const searchParams = useSearchParams();
    const { replace } = useRouter();
    const [isPending, startTransition] = useTransition();
    const [term, setTerm] = React.useState(searchParams.get('q')?.toString() || '');
    const [placeholder, setPlaceholder] = React.useState('検索');

    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 640) { // sm breakpoint
                setPlaceholder('キーワードで検索');
            } else {
                setPlaceholder('検索');
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Get sort from URL or default to 'latest'
    const currentSort = searchParams.get('sort') || 'latest';

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

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('sort', value);
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
            <Select value={currentSort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[110px] sm:w-[130px] h-12 border-slate-200 bg-white focus:ring-0 focus:border-[#007bff] shrink-0">
                    <SelectValue placeholder="新着順" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="latest">新着順</SelectItem>
                    <SelectItem value="price_desc">高い順</SelectItem>
                    <SelectItem value="price_asc">低い順</SelectItem>
                    <SelectItem value="likes">いいね順</SelectItem>
                </SelectContent>
            </Select>

            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                    placeholder={placeholder}
                    className="pl-10 w-full"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>
            <Button
                onClick={handleSearch}
                disabled={isPending}
                className="bg-[#007bff] hover:bg-[#0069d9] text-white font-bold"
            >
                {isPending ? '検索中...' : '検索'}
            </Button>
        </div>
    );
}
