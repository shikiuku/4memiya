'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteProduct } from '@/actions/admin/product';
import { useRouter } from 'next/navigation';

interface DeleteButtonProps {
    id: string;
}

export function DeleteButton({ id }: DeleteButtonProps) {
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
            className="bg-red-600 text-white hover:bg-red-700 font-bold border-0"
            onClick={handleDelete}
            disabled={isDeleting}
        >
            <Trash2 className="w-4 h-4 mr-1" />
            {isDeleting ? '削除中...' : '削除'}
        </Button>
    );
}
