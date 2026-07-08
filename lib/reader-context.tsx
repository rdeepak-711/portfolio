"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ReaderCtx = { reader: boolean; toggle: () => void };
const Ctx = createContext<ReaderCtx>({ reader: false, toggle: () => {} });

export function ReaderProvider({ children }: { children: React.ReactNode }) {
  const [reader, setReader] = useState(false);

  // Restore preference before paint where possible.
  useEffect(() => {
    const saved = localStorage.getItem("reader-mode") === "1";
    setReader(saved);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("reader", reader);
    localStorage.setItem("reader-mode", reader ? "1" : "0");
  }, [reader]);

  return <Ctx.Provider value={{ reader, toggle: () => setReader((v) => !v) }}>{children}</Ctx.Provider>;
}

export const useReader = () => useContext(Ctx);
