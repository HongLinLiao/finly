"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "finly:hide-new-user-guide";

interface NewUserGuideDialogProps {
  isNewUser: boolean;
}

export function NewUserGuideDialog({ isNewUser }: NewUserGuideDialogProps) {
  const [open, setOpen] = useState(false);
  const [hideNextTime, setHideNextTime] = useState(false);

  useEffect(() => {
    if (!isNewUser) return;

    let cancelled = false;

    window.queueMicrotask(() => {
      if (cancelled) return;

      try {
        const hidden = window.localStorage.getItem(STORAGE_KEY) === "true";
        setHideNextTime(hidden);
        setOpen(!hidden);
      } catch {
        setOpen(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isNewUser]);

  if (!isNewUser) return null;

  function handleHideNextTimeChange(checked: boolean) {
    setHideNextTime(checked);

    try {
      if (checked) {
        window.localStorage.setItem(STORAGE_KEY, "true");
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage can be unavailable in restricted browser contexts.
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>開始使用 Finly</DialogTitle>
          <DialogDescription>
            先完成帳戶架構，再開始記錄投資交易，資產與現金流水才會正確對上。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm text-foreground">
          <div className="space-y-3 rounded-2xl border bg-muted/40 p-4">
            <p className="font-medium">建議流程</p>
            <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
              <li>先到側邊欄「現金帳戶 - 帳戶設定」建立證券戶。</li>
              <li>在該證券戶底下建立對應的資金戶與幣別。</li>
              <li>建立股票或基金交易前，到「現金帳戶 - 帳戶交易」替資金戶記錄入金。</li>
              <li>之後新增股票或基金交易時，系統會同步建立對應的資金戶流水。</li>
            </ol>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-2.5">
            <input
              type="checkbox"
              checked={hideNextTime}
              onChange={event => handleHideNextTimeChange(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <span className="leading-relaxed text-muted-foreground">不再提醒</span>
          </label>
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => setOpen(false)}>
            我知道了
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
