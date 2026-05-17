"use client";

import { Landmark } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
  createBrokerageAccount,
  type CreateBrokerageAccountState,
} from "@/services/brokerage/createBrokerageAccount";

import { RequiredMark } from "../util/form/required-mark";

import type { CurrencyOption } from "@/lib/frankfurter";

interface AddBrokerageAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currencies: CurrencyOption[];
}

const initialState: CreateBrokerageAccountState = {
  success: false,
  message: "",
};

function AddBrokerageAccountForm({
  currencies,
  onSuccess,
}: {
  currencies: CurrencyOption[];
  onSuccess: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createBrokerageAccount, initialState);

  useEffect(() => {
    if (!state.success) return;

    formRef.current?.reset();
    onSuccess();
  }, [onSuccess, state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <div className="grid gap-4">
        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-500">
            帳戶名稱
            <RequiredMark />
          </span>
          <Input name="accountName" required placeholder="例如 元大主戶" />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-500">
            證券商名稱
            <RequiredMark />
          </span>
          <Input name="brokerName" required placeholder="例如 元大證券" />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-500">證券戶號</span>
          <Input name="accountNo" placeholder="可留空或輸入遮罩戶號" />
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground dark:text-zinc-500">幣別</span>
          <Select name="baseCurrency" defaultValue="TWD">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="選擇幣別" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(currency => (
                <SelectItem key={currency.code} value={currency.code}>
                  <span className="font-medium">{currency.code}</span>
                  <span className="text-muted-foreground">{currency.name}</span>
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
          {isPending ? "新增中" : "新增"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AddBrokerageAccountDialog({
  open,
  onOpenChange,
  currencies,
}: AddBrokerageAccountDialogProps) {
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
            <Landmark className="size-4 text-primary" />
            新增證券戶
          </DialogTitle>
        </DialogHeader>

        <AddBrokerageAccountForm
          key={formKey}
          currencies={currencies}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
