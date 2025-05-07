/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { SWRConfiguration } from "swr";

async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    const data = await res.json();
    (error as any).info = data.error;
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
}

export const swrConfig: SWRConfiguration = {
  fetcher,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
};
