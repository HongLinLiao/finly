"use client";

import { Building2, CircleDollarSign, Plus } from "lucide-react";
import { useState } from "react";

import { AddBrokerageAccountDialog } from "@/components/brokerage/add-brokerage-account-dialog";
import { AddCashAccountDialog } from "@/components/brokerage/add-cash-account-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { CurrencyOption } from "@/lib/frankfurter";
import type { BrokerageAccountWithCashAccounts } from "@/services/brokerage/getBrokerageAccounts";
import type { ComponentType } from "react";

interface AddAccountFabProps {
  accounts: BrokerageAccountWithCashAccounts[];
  currencies: CurrencyOption[];
}

type ActionAvailabilityContext = Pick<AddAccountFabProps, "accounts">;
type AddAccountAction = {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  className: string;
  isEnabled: (context: ActionAvailabilityContext) => boolean;
};

const actions: AddAccountAction[] = [
  {
    key: "brokerage",
    label: "新增證券戶",
    icon: Building2,
    className: "right-14 bottom-16",
    isEnabled: () => true,
  },
  {
    key: "cash",
    label: "新增資金戶",
    icon: CircleDollarSign,
    className: "right-20 bottom-1",
    isEnabled: ({ accounts }: ActionAvailabilityContext) => accounts.length > 0,
  },
] as const;

export function AddAccountFab({ accounts, currencies }: AddAccountFabProps) {
  const [open, setOpen] = useState(false);
  const [brokerageDialogOpen, setBrokerageDialogOpen] = useState(false);
  const [cashDialogOpen, setCashDialogOpen] = useState(false);
  const actionContext = { accounts };

  function handleActionSelect(actionKey: string) {
    setOpen(false);

    if (actionKey === "brokerage") {
      setBrokerageDialogOpen(true);
    } else if (actionKey === "cash") {
      setCashDialogOpen(true);
    }
  }

  return (
    <>
      <AddBrokerageAccountDialog
        open={brokerageDialogOpen}
        onOpenChange={setBrokerageDialogOpen}
        currencies={currencies}
      />
      <AddCashAccountDialog
        open={cashDialogOpen}
        onOpenChange={setCashDialogOpen}
        accounts={accounts}
        currencies={currencies}
      />

      {open ? (
        <button
          type="button"
          aria-label="關閉新增帳戶選單"
          className="fixed inset-0 z-30 cursor-default bg-transparent"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="fixed right-4 z-40 bottom-[calc(env(safe-area-inset-bottom)+98px)] md:right-6 md:bottom-6">
        <div aria-hidden={!open} className="relative">
          {actions.map(action => {
            const Icon = action.icon;
            const enabled = action.isEnabled(actionContext);

            return (
              <Button
                key={action.key}
                type="button"
                variant={enabled ? "secondary" : "outline"}
                disabled={!enabled}
                aria-label={action.label}
                title={action.label}
                className={cn(
                  "absolute h-10 gap-2 rounded-full px-3 shadow-lg transition-all duration-200 ease-out",
                  "ring-1 ring-border/80",
                  action.className,
                  open
                    ? "pointer-events-auto visible translate-x-0 translate-y-0 scale-100 opacity-100 disabled:opacity-45"
                    : "pointer-events-none invisible translate-x-12 translate-y-4 scale-75 opacity-0"
                )}
                onClick={() => handleActionSelect(action.key)}
              >
                <Icon className="size-4" />
                <span className="text-sm">{action.label}</span>
              </Button>
            );
          })}
        </div>

        <Button
          type="button"
          size="icon-lg"
          className="relative z-10 rounded-full shadow-lg ring-1 ring-emerald-500/45"
          aria-label={open ? "關閉新增帳戶選單" : "新增帳戶"}
          aria-expanded={open}
          onClick={() => setOpen(current => !current)}
        >
          <Plus className={cn("transition-transform duration-200", open && "rotate-45")} />
        </Button>
      </div>
    </>
  );
}
