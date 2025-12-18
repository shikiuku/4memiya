'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteProduct } from '@/actions/admin/product';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';

interface DeleteButtonProps {
    id: string;
    className?: string;
}

export function DeleteButton({ id, className }: DeleteButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('本当に削除しますか？\nこの操作は取り消せません。')) {
            return;
        }

        setIsDeleting(true);
        const result = await deleteProduct(id);

        if (result?.error) {
            alert(result.error);
            setIsDeleting(false);
        } else {
            // Success - revalidation is handled by server action, but we might want to refresh locally to be sure
            // However, server action revalidatePath should update the page automatically if it's a server component parent
        }
    };

    return (
        <Button
            size="sm"
            variant="ghost"
            className={cn("bg-red-50 text-red-600 hover:bg-red-100 font-bold border-0", className)}
            onClick={handleDelete}
            disabled={isDeleting}
        >
            <Trash2 className="w-4 h-4" />
            <span className="ml-0.5">{isDeleting ? '削除中' : '削除'}</span>
        </Button>
    );
}
