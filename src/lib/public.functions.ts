import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export type Resource = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string | null;
  body: string | null;
  image_url: string | null;
  published_at: string;
};

export const listResources = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("resources")
    .select("id,slug,title,category,excerpt,body,image_url,published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error) {
    console.error(error);
    return [] as Resource[];
  }
  return (data ?? []) as Resource[];
});

export const getResource = createServerFn({ method: "GET" })
  .inputValidator((i: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(i))
  .handler(async ({ data }) => {
    const { data: row } = await publicClient()
      .from("resources")
      .select("id,slug,title,category,excerpt,body,image_url,published_at")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    return (row ?? null) as Resource | null;
  });

export const submitAccessRequest = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z
      .object({
        first_name: z.string().trim().min(1).max(80),
        last_name: z.string().trim().min(1).max(80),
        company: z.string().trim().min(1).max(160),
        job_title: z.string().trim().max(120).optional().nullable(),
        email: z.string().trim().email().max(255),
        phone: z.string().trim().max(40).optional().nullable(),
        country: z.string().trim().max(80).optional().nullable(),
        reason: z.string().trim().min(1).max(200),
        message: z.string().trim().max(2000).optional().nullable(),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    const { error } = await publicClient().from("access_requests").insert(data);
    if (error) {
      console.error(error);
      throw new Error("Could not submit request. Please try again.");
    }
    return { ok: true };
  });

export const submitInquiry = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z
      .object({
        first_name: z.string().trim().min(1).max(80),
        last_name: z.string().trim().min(1).max(80),
        email: z.string().trim().email().max(255),
        organization: z.string().trim().max(160).optional().nullable(),
        phone: z.string().trim().max(40).optional().nullable(),
        category: z.string().trim().max(80),
        message: z.string().trim().min(1).max(5000),
      })
      .parse(i),
  )
  .handler(async ({ data }) => {
    const { error } = await publicClient().from("contact_submissions").insert({
      name: `${data.first_name} ${data.last_name}`,
      email: data.email,
      organization: data.organization,
      phone: data.phone,
      category: data.category,
      subject: data.category,
      message: data.message,
    });
    if (error) {
      console.error(error);
      throw new Error("Could not send inquiry. Please try again.");
    }
    return { ok: true };
  });
