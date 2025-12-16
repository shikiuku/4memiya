'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface Props {
    availableTags?: string[];
}

export function ProductSearch({ availableTags = [] }: Props) {
    const searchParams = useSearchParams();
    const { replace } = useRouter();
    const [isPending, startTransition] = useTransition();

    const currentTag = searchParams.get('tag');

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

    const handleTagClick = (tag: string) => {
        const params = new URLSearchParams(searchParams);
        if (currentTag === tag) {
            params.delete('tag');
        } else {
            params.set('tag', tag);
        }
        params.delete('page');

        startTransition(() => {
            replace(`/?${params.toString()}`);
        });
    }

    return (
        <div className="flex flex-col gap-3 w-full md:w-auto">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                    placeholder="キーワードで検索"
                    className="pl-10 w-full md:w-[300px]"
                    onChange={(e) => handleSearch(e.target.value)}
                    defaultValue={searchParams.get('q')?.toString()}
                />
                {isPending && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            {availableTags.length > 0 && (
                <div className="flex flex-wrap gap-2 max-w-[500px]">
                    {availableTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => handleTagClick(tag)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${currentTag === tag
                                    ? 'bg-slate-800 text-white border-slate-800'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
