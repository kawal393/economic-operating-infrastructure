import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

function getProvider(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  const injected = (window as unknown as { ethereum?: EthereumProvider }).ethereum;
  return injected ?? null;
}

/**
 * Browser wallet connection (MetaMask / any EIP-1193 injected provider).
 * Read-only by design: connecting never signs or sends a transaction.
 */
export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;

    let cancelled = false;
    void (async () => {
      try {
        const accounts = (await provider.request({ method: "eth_accounts" })) as string[];
        if (!cancelled && accounts?.length) setAddress(accounts[0] ?? null);
        const id = (await provider.request({ method: "eth_chainId" })) as string;
        if (!cancelled) setChainId(id ?? null);
      } catch {
        /* provider unavailable — stay disconnected */
      }
    })();

    const onAccounts = (...args: unknown[]) => {
      const accounts = args[0] as string[] | undefined;
      setAddress(accounts?.length ? (accounts[0] ?? null) : null);
    };
    const onChain = (...args: unknown[]) => setChainId((args[0] as string) ?? null);

    provider.on?.("accountsChanged", onAccounts);
    provider.on?.("chainChanged", onChain);

    return () => {
      cancelled = true;
      provider.removeListener?.("accountsChanged", onAccounts);
      provider.removeListener?.("chainChanged", onChain);
    };
  }, []);

  const connect = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      toast.error("No wallet detected", {
        description: "Install MetaMask or another EIP-1193 wallet to connect.",
      });
      return;
    }
    setConnecting(true);
    try {
      const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
      const next = accounts?.[0] ?? null;
      setAddress(next);
      if (next) {
        toast.success("Wallet connected", {
          description: `${next.slice(0, 6)}…${next.slice(-4)}`,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Connection rejected.";
      toast.error("Wallet connection failed", { description: message });
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    toast("Wallet disconnected");
  }, []);

  return { address, chainId, connecting, connect, disconnect, hasProvider: !!getProvider() };
}

export function shortAddress(address: string | null) {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/** Deterministic pseudo-digest for client-side preview sealing. */
export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
