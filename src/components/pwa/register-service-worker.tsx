"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    // Avoid hydration and stale-asset issues during local development.
    if (process.env.NODE_ENV !== "production") {
      const cleanupDevServiceWorkers = async () => {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));

        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(key => caches.delete(key)));
        }
      };

      cleanupDevServiceWorkers().catch(error => {
        console.error("Service worker cleanup failed:", error);
      });

      return;
    }

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        await registration.update();
      } catch (error) {
        console.error("Service worker registration failed:", error);
      }
    };

    window.addEventListener("load", register);

    return () => {
      window.removeEventListener("load", register);
    };
  }, []);

  return null;
}
