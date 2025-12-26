'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addCharacterTag, deleteCharacterTag } from '@/actions/admin/character-tags';

interface AttributeTagSelectorProps {
    attribute: string;
    initialValue?: string;
    suggestedTags: string[];
}

export function AttributeTagSelector({ attribute, initialValue = '', suggestedTags = [] }: AttributeTagSelectorProps) {
    // Current selected tags (for this product)
    const [selectedTags, setSelectedTags] = useState<string[]>(
        initialValue ? initialValue.split(',').map(s => s.trim()).filter(Boolean) : []
    );
    const [inputValue, setInputValue] = useState('');

    // Available master tags for this attribute
    const [availableTags, setAvailableTags] = useState<string[]>(suggestedTags);

    const addTagToProduct = (tag: string) => {
        if (!tag || selectedTags.includes(tag)) return;
        setSelectedTags([...selectedTags, tag.trim()]);
    };

    const removeTagFromProduct = (tagToRemove: string) => {
        setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
    };

    const addTagToMaster = async () => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;

        // Optimistically update
        if (!availableTags.includes(trimmed)) {
            setAvailableTags([...availableTags, trimmed]);
            await addCharacterTag(attribute, trimmed);
        }

        // Also select for product
        addTagToProduct(trimmed);
        setInputValue('');
    };

    const deleteFromMaster = async (e: React.MouseEvent, tagToDelete: string) => {
        e.stopPropagation();
        if (!confirm(`${tagToDelete} をマスタから削除しますか？`)) return;

        await deleteCharacterTag(attribute, tagToDelete);
        setAvailableTags(availableTags.filter(t => t !== tagToDelete));
        removeTagFromProduct(tagToDelete); // Also remove from selection if present
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTagToMaster();
        }
    };

    return (
        <div className="flex-1 space-y-3">
            {/* Hidden input for form submission */}
            <input type="hidden" name={`char_${attribute}`} value={selectedTags.join(', ')} />

            {/* Selected Tags Display */}
            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-slate-50 rounded-md border border-slate-100">
                {selectedTags.length === 0 && <span className="text-sm text-slate-400">未選択</span>}
                {selectedTags.map(tag => (
                    <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTagFromProduct(tag)}
                            className="ml-1 inline-flex items-center justify-center w-3 h-3 rounded-full hover:bg-blue-200 text-blue-500 hover:text-blue-700 focus:outline-none transition-colors"
                        >
                            <X className="w-2 h-2" />
                        </button>
                    </span>
                ))}
            </div>

            {/* Input & Suggestions */}
            <div className="space-y-2">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="新キャラを入力して追加..."
                        className="flex-1 px-3 py-1.5 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                    <Button
                        type="button"
                        onClick={addTagToMaster}
                        disabled={!inputValue.trim()}
                        size="sm"
                        className="bg-slate-800 text-white hover:bg-slate-700 h-8"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        追加
                    </Button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {availableTags.map(tag => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                            <div
                                key={tag}
                                className={`
                                    group inline-flex items-center rounded-full text-[11px] font-bold border cursor-pointer transition-all
                                    ${isSelected
                                        ? 'bg-blue-50 border-blue-200 text-blue-600 opacity-50'
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'
                                    }
                                `}
                                onClick={() => !isSelected && addTagToProduct(tag)}
                            >
                                <span className="px-2 py-1">{tag}</span>
                                <button
                                    type="button"
                                    onClick={(e) => deleteFromMaster(e, tag)}
                                    className="pr-1.5 pl-0.5 py-1 text-slate-300 hover:text-red-500 focus:outline-none transition-opacity border-l border-slate-100"
                                    title="マスタから削除"
                                >
                                    <X className="w-2.5 h-2.5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
