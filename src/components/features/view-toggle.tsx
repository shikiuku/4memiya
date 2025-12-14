import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ViewToggleProps = {
    viewMode: 'grid' | 'list';
    onToggle: (mode: 'grid' | 'list') => void;
};

export function ViewToggle({ viewMode, onToggle }: ViewToggleProps) {
    return (
        <div className="flex bg-slate-100 p-1 rounded-lg">
            <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onToggle('list')}
                className={`rounded-md h-8 w-8 p-0 ${viewMode !== 'list' && 'bg-transparent hover:bg-white/50'}`}
            >
                <List className="w-4 h-4" />
            </Button>
            <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onToggle('grid')}
                className={`rounded-md h-8 w-8 p-0 ${viewMode !== 'grid' && 'bg-transparent hover:bg-white/50'}`}
            >
                <LayoutGrid className="w-4 h-4" />
            </Button>
        </div>
    );
}
