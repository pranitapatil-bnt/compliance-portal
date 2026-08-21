import { appConfig } from "@/config/app";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
      {appConfig.name} · Compliance
    </footer>
  );
}
