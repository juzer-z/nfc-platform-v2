function required(name: keyof ImportMetaEnv) {
  return import.meta.env[name] ?? "";
}

export const env = {
  supabaseUrl: required("VITE_SUPABASE_URL"),
  supabaseAnonKey: required("VITE_SUPABASE_ANON_KEY"),
  imagekitUrlEndpoint: required("VITE_IMAGEKIT_URL_ENDPOINT"),
  imagekitPublicKey: required("VITE_IMAGEKIT_PUBLIC_KEY"),
  appUrl: required("VITE_APP_URL"),
};

export function hasSupabaseConfig() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}
