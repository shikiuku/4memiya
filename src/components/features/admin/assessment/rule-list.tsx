'use client';

import { AssessmentRule } from '@/types';
import { RuleFormDialog } from './rule-form-dialog';
import { CategorySettingsDialog } from './category-settings-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical, Plus } from 'lucide-react';
import { deleteAssessmentRule, updateCategoryOrder } from '@/actions/admin/assessment';
import { useTransition, useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface RuleListProps {
    rules: AssessmentRule[];
}

const CATEGORY_LABELS: Record<string, string> = {
    'rank': 'ランク',
    'luck_max': '運極数',
    'gacha_charas': 'ガチャ限数',
    'character': 'キャラクター',
};

export function RuleList({ rules }: RuleListProps) {
    const [isMounted, setIsMounted] = useState(false);

    // Compute initial grouped rules
    // Note: rules are already sorted by sort_order from the server
    const groupedRules = rules.reduce((acc, rule) => {
        const cat = rule.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(rule);
        return acc;
    }, {} as Record<string, AssessmentRule[]>);

    // Initial categories order based on the rules array order (which is sorted by DB)
    // We use a Set to keep unique categories in order of appearance
    const initialCategories = Array.from(new Set(rules.map(r => r.category)));

    const [items, setItems] = useState(initialCategories);
    const [isSavingOrder, startOrderTransition] = useTransition();

    // Sync state if server data changes (e.g. initial load or revalidation)
    useEffect(() => {
        setIsMounted(true);
        setItems(Array.from(new Set(rules.map(r => r.category))));
    }, [rules]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.indexOf(active.id as string);
            const newIndex = items.indexOf(over.id as string);
            const newOrder = arrayMove(items, oldIndex, newIndex);

            setItems(newOrder);

            // Save new order to DB
            startOrderTransition(async () => {
                await updateCategoryOrder(newOrder);
            });
        }
    }

    if (!isMounted) {
        return <div className="p-8 text-center text-slate-500">Loading editor...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <RuleFormDialog
                    trigger={
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            新規カテゴリ追加
                        </Button>
                    }
                />
                {isSavingOrder && <span className="text-xs text-slate-500 animate-pulse">並び順を保存中...</span>}
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items}
                    strategy={verticalListSortingStrategy}
                >
                    {items.map(category => (
                        <SortableCategoryItem
                            key={category}
                            category={category}
                            rules={groupedRules[category] || []}
                        />
                    ))}
                </SortableContext>
            </DndContext>

            {items.length === 0 && (
                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg">
                    まだルールがありません。「新規ルール追加」から作成してください。
                </div>
            )}
        </div>
    );
}

// Sub-component for Sortable Item
function SortableCategoryItem({ category, rules }: { category: string, rules: AssessmentRule[] }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: category });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // Determine display name for the category
    let displayName = CATEGORY_LABELS[category];
    if (!displayName) {
        // For dynamic categories, use the label from the first rule that has one
        const ruleWithLabel = rules.find(r => r.label);
        displayName = ruleWithLabel?.label || category;
    }

    // Determine current settings (placeholder/unit) from representative rule
    const representativeRule = rules.find(r => r.input_placeholder || r.input_unit) || rules[0];
    const currentPlaceholder = representativeRule?.input_placeholder || '';
    const currentUnit = representativeRule?.input_unit || '';

    return (
        <div ref={setNodeRef} style={style} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 relative group">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
                <div className="flex items-center gap-3">
                    {/* Drag Handle */}
                    <div {...attributes} {...listeners} className="cursor-grab hover:text-slate-700 text-slate-400 p-1 rounded hover:bg-slate-100">
                        <GripVertical className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold capitalize text-slate-800 flex items-center gap-2">
                            {displayName}
                            <CategorySettingsDialog
                                category={category}
                                currentLabel={displayName}
                                currentPlaceholder={currentPlaceholder}
                                currentUnit={currentUnit}
                            />
                        </h2>
                    </div>
                </div>
                {/* Add Rule Button for this category */}
                <RuleFormDialog defaultCategory={category} />
            </div>

            <div className="space-y-2">
                {rules.map(rule => (
                    <RuleItem key={rule.id} rule={rule} />
                ))}
            </div>
        </div>
    );
}

function RuleItem({ rule }: { rule: AssessmentRule }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm('このルールを削除しますか？')) return;
        startTransition(async () => {
            const result = await deleteAssessmentRule(rule.id);
            if (result?.error) alert(result.error);
        });
    };

    const label = rule.rule_type === 'range'
        ? rule.label
        : rule.label;

    return (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100 hover:bg-slate-100 transition-colors">
            <div className="flex-1">
                <div className="font-bold text-slate-700 flex items-center gap-2">
                    {rule.rule_type === 'range' ? (
                        <span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded mr-2">数値</span>
                            {rule.threshold?.toLocaleString()} 以上
                            {/* Show label if present for range rules */}
                            {rule.label && <span className="ml-2 text-xs text-slate-500">({rule.label})</span>}
                        </span>
                    ) : (
                        <span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded mr-2">チェックボックス</span>
                            {rule.label}
                        </span>
                    )}
                    <span className="text-slate-400">→</span>
                    <span className="text-[#e60012]">+ {rule.price_adjustment.toLocaleString()} 円</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <RuleFormDialog existingRule={rule} />
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                    onClick={handleDelete}
                    disabled={isPending}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
