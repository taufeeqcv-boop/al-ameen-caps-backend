import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function StoreNotice() {
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "store_notice")
      .single()
      .then(({ data }) => {
        const v = (data?.value || "").trim();
        if (v) setNotice(v);
      });
  }, []);

  if (!notice) return null;

  return (
    <div className="bg-amber-500 text-black text-center py-2 px-4 text-sm font-bold">
      {notice}
    </div>
  );
}
