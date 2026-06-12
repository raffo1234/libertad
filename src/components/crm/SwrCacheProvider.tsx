import { SWRConfig } from "swr";
import { sessionStorageProvider } from "../../lib/swrCache";

export default function SwrCacheProvider({ children }: { children: React.ReactNode }) {
  return <SWRConfig value={{ provider: sessionStorageProvider }}>{children}</SWRConfig>;
}
