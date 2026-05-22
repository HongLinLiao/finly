"use client";

import { Pencil } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateBrokerageAccount,
  type UpdateBrokerageAccountState,
} from "@/services/brokerage/updateBrokerageAccount";

import { RequiredMark } from "../util/form/required-mark";

import type { BrokerageAccountWithCashAccounts } from "@/services/brokerage/getBrokerageAccounts";
import type { AccountStatus } from "@/types";

interface EditBrokerageAccountDialogProps {
  account: BrokerageAccountWithCashAccounts;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialState: UpdateBrokerageAccountState = {
  success: false,
  message: "",
};

const statusOptions: { value: AccountStatus; label: string }[] = [
  { value: "active", label: "啟用中" },
  { value: "inactive", label: "暫停使用" },
  { value: "closed", label: "已結清" },
];

function EditBrokerageAccountForm({
  account,
  onSuccess,
}: {
  account: BrokerageAccountWithCashAccounts;
  onSuccess: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(updateBrokerageAccount, initialState);

  useEffect(() => {
    if (!state.success) return;

    onSuccess();
  }, [onSuccess, state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={account.id} />

      <div className="grid gap-4">
        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-500">
            帳戶名稱
            <RequiredMark />
          </span>
          <Input name="accountName" required defaultValue={account.account_name} />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-500">
            證券商名稱
            <RequiredMark />
          </span>
          <Input name="brokerName" required defaultValue={account.broker_name} />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-500">證券戶號</span>
          <Input name="accountNo" defaultValue={account.account_no ?? ""} />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-500">幣別</span>
          <Input
            value={account.base_currency ?? "未設定"}
            disabled
            className="border-border/60 bg-muted/70 text-muted-foreground disabled:opacity-70 dark:bg-zinc-900/60"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-500">
            狀態
            <RequiredMark />
          </span>
          <Select name="status" defaultValue={account.status} required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="選擇狀態" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      {state.message && !state.success ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      <DialogFooter>
        <Button type="button" variant="outline" disabled={isPending} onClick={onSuccess}>
          取消
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "儲存中" : "儲存"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditBrokerageAccountDialog({
  account,
  open,
  onOpenChange,
}: EditBrokerageAccountDialogProps) {
  const [formKey, setFormKey] = useState(0);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setFormKey(key => key + 1);
    }

    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader className="space-y-2 pb-1">
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="size-4 text-primary" />
            編輯證券戶
          </DialogTitle>
          <DialogDescription className="sr-only">
            編輯證券戶的帳戶名稱、證券商、戶號與狀態；幣別僅供檢視。
          </DialogDescription>
        </DialogHeader>

        <EditBrokerageAccountForm
          key={formKey}
          account={account}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
