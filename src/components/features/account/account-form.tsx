'use client';

import { useActionState } from 'react';
import { updateAccountCredentials, UpdateAccountState } from '@/actions/account';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const initialState: UpdateAccountState = {};

interface AccountFormProps {
    currentUsername?: string; // This is the ID
    currentDisplayName?: string; // This is the Name
}

export function AccountForm({ currentUsername, currentDisplayName }: AccountFormProps) {
    const [state, formAction, isPending] = useActionState(updateAccountCredentials, initialState);

    return (
        <form action={formAction} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 max-w-lg mx-auto">
            {state.error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-start gap-2 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{state.error}</span>
                </div>
            )}

            {state.success && (
                <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-lg flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{state.message}</span>
                </div>
            )}

            <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-md border border-slate-100 mb-6">
                    <Label htmlFor="currentPassword">現在のパスワード（必須）</Label>
                    <p className="text-xs text-slate-500 mb-2">本人確認のため、現在のパスワードを入力してください。</p>
                    <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        required
                        placeholder="パスワードを入力"
                        className="bg-white"
                    />
                </div>

                <div className="border-t border-slate-100 pt-6">
                    <h3 className="font-bold text-slate-800 mb-4">アカウント情報の変更</h3>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="newUsername">アカウント名（表示名）</Label>
                            <Input
                                id="newUsername"
                                name="newUsername"
                                type="text"
                                placeholder={currentDisplayName || "表示名を入力"}
                                defaultValue={currentDisplayName}
                            />
                        </div>

                        <div>
                            <Label htmlFor="newLoginId">新しいログインID</Label>
                            <p className="text-xs text-slate-400 mb-1">※変更するとログイン時のIDが変わります</p>
                            <Input
                                id="newLoginId"
                                name="newLoginId"
                                type="text"
                                placeholder={currentUsername || "半角英数字"}
                                defaultValue={currentUsername}
                            />
                        </div>

                        <div>
                            <Label htmlFor="newPassword">新しいパスワード</Label>
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                placeholder="6文字以上 (変更しない場合は空欄)"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
                        disabled={isPending}
                    >
                        {isPending ? '更新中...' : '設定を保存する'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
