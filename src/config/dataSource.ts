// Chooses which backend the service layer talks to. Screens should never
// branch on this directly — services/repositories read it and decide
// whether to hit Supabase or fall back to src/data/mock.

export type DataSourceMode = "mock" | "supabase";

function readDataSourceMode(): DataSourceMode {
  const raw = process.env.EXPO_PUBLIC_DATA_SOURCE?.trim().toLowerCase();

  if (raw === "supabase") return "supabase";
  if (raw === "mock" || !raw) return "mock";

  if (__DEV__) {
    console.warn(
      `[WashGo] Unknown EXPO_PUBLIC_DATA_SOURCE "${raw}" — expected "mock" or "supabase". Falling back to "mock".`,
    );
  }
  return "mock";
}

export const dataSourceMode: DataSourceMode = readDataSourceMode();
export const isSupabaseDataSource = dataSourceMode === "supabase";

console.log("[WashGo] DATA SOURCE:", dataSourceMode);
console.log("[WashGo] SUPABASE MODE:", isSupabaseDataSource);
