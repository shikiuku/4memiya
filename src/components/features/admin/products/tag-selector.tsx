'use client';

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { addTag, deleteTag } from '@/actions/admin/tags';

interface TagSelectorProps {
    initialTags?: string[];
    suggestedTags: string[];
}

export function TagSelector({ initialTags = [], suggestedTags = [] }: TagSelectorProps) {
    const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
    const [inputValue, setInputValue] = useState('');

    // Manage available tags as state so we can add/delete from it
    const [availableTags, setAvailableTags] = useState<string[]>(suggestedTags);

    const addTagHandler = async (tag: string) => {
        const trimmed = tag.trim();
        if (!trimmed) return;

        // Add to selected if not already selected
        if (!selectedTags.includes(trimmed)) {
            setSelectedTags([...selectedTags, trimmed]);
        }

        // Also add to available tags if not present AND permanently save to DB
        if (!availableTags.includes(trimmed)) {
            setAvailableTags([...availableTags, trimmed]);
            // Fire and forget add to DB (or await if critical)
            await addTag(trimmed);
        }

        setInputValue('');
    };

    const removeSelectedTag = (tagToRemove: string) => {
        setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
    };

    const deleteFromAvailable = async (e: React.MouseEvent, tagToDelete: string) => {
        e.stopPropagation();

        const result = await deleteTag(tagToDelete);

        if (result?.error) {
            alert('削除に失敗しました: ' + result.error);
        } else {
            setAvailableTags(availableTags.filter(t => t !== tagToDelete));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTagHandler(inputValue);
        }
    };

    return (
        <div className="space-y-4">
            <input type="hidden" name="tags" value={selectedTags.join(',')} />

            {/* Selected Tags Display */}
            <div className="flex flex-wrap gap-2 min-h-[32px] p-2 bg-slate-50 rounded-md border border-slate-100">
                {selectedTags.length === 0 && <span className="text-sm text-slate-400">選択されたタグはありません</span>}
                {selectedTags.map(tag => (
                    <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeSelectedTag(tag)}
                            className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 text-blue-500 hover:text-blue-700 focus:outline-none transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="新しいタグを入力して追加..."
                    className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
                <Button
                    type="button"
                    onClick={() => addTagHandler(inputValue)}
                    disabled={!inputValue.trim()}
                    size="sm"
                    className="bg-slate-800 text-white hover:bg-slate-700"
                >
                    <Plus className="w-4 h-4 mr-1" />
                    追加
                </Button>
            </div>

            {/* Suggestions List */}
            <div>
                <p className="text-sm font-bold text-slate-700 mb-2">タグ</p>
                <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                            <div
                                key={tag}
                                className={`
                                    group inline-flex items-center rounded-full text-xs font-medium border cursor-pointer transition-all
                                    ${isSelected
                                        ? 'bg-blue-50 border-blue-200 text-blue-600 opacity-50'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                                    }
                                `}
                                onClick={() => !isSelected && addTagHandler(tag)}
                            >
                                <span className="px-3 py-1.5">{tag}</span>
                                <button
                                    type="button"
                                    onClick={(e) => deleteFromAvailable(e, tag)}
                                    className="pr-2 pl-1 py-1.5 text-slate-300 hover:text-red-500 focus:outline-none transition-opacity border-l border-slate-100"
                                    title="リストから削除"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
