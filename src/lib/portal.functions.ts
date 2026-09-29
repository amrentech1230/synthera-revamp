import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PortalProduct = {
  id: string;
  slug: string;
  name: string;
  sku: string | null;
  product_type: string;
  availability: string;
  status: string;
  short_desc: string | null;
  long_desc: string | null;
  scientific_info: string | null;
  therapeutic_info: string | null;
  images: string[];
  created_at: string;
  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;
};

const COLS =
  "id,slug,name,sku,product_type,availability,status,short_desc,long_desc,scientific_info,therapeutic_info,images,created_at,category_id,categories(slug,name)";

function mapProduct(r: any): PortalProduct {
  return { ...r, category_name: r.categories?.name ?? null, category_slug: r.categories?.slug ?? null };
}

export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;
    const [{ data: profile }, { data: isAdmin }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
    ]);
    return { userId, email: (claims as any).email as string | undefined, profile, isAdmin: !!isAdmin };
  });

export const portalProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("products")
      .select(COLS)
      .eq("status", "active")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapProduct);
  });

export const portalCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("categories").select("id,slug,name").order("sort_order");
    return data ?? [];
  });

export const portalProduct = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row } = await supabase.from("products").select(COLS).eq("slug", data.slug).maybeSingle();
    if (!row) return null;
    const { data: docs } = await supabase
      .from("product_documents")
      .select("id,title,doc_type,file_path")
      .eq("product_id", (row as any).id);
    const withUrls = await Promise.all(
      (docs ?? []).map(async (d) => {
        const { data: s } = await supabase.storage.from("product-docs").createSignedUrl(d.file_path, 600);
        return { ...d, url: s?.signedUrl ?? null };
      }),
    );
    return { product: mapProduct(row), documents: withUrls };
  });

export const allDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data } = await supabase
      .from("product_documents")
      .select("id,title,doc_type,file_path,created_at,products(name,slug)")
      .order("created_at", { ascending: false });
    return Promise.all(
      (data ?? []).map(async (d: any) => {
        const { data: s } = await supabase.storage.from("product-docs").createSignedUrl(d.file_path, 600);
        return {
          id: d.id,
          title: d.title,
          doc_type: d.doc_type,
          created_at: d.created_at,
          product_name: d.products?.name ?? null,
          product_slug: d.products?.slug ?? null,
          url: s?.signedUrl ?? null,
        };
      }),
    );
  });

export const createProductRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({ productId: z.string().uuid(), message: z.string().trim().max(2000).optional() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("product_requests")
      .insert({ user_id: context.userId, product_id: data.productId, message: data.message ?? null });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const myRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("product_requests")
      .select("id,status,message,admin_note,created_at,updated_at,products(name,slug)")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => ({
      ...r,
      product_name: r.products?.name ?? "—",
      product_slug: r.products?.slug ?? null,
    }));
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        first_name: z.string().max(80).nullable(),
        last_name: z.string().max(80).nullable(),
        phone: z.string().max(40).nullable(),
        company: z.string().max(160).nullable(),
        job_title: z.string().max(120).nullable(),
        country: z.string().max(80).nullable(),
        address: z.string().max(300).nullable(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").upsert({ id: context.userId, ...data });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const submitSupport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        topic: z.string().max(80),
        subject: z.string().trim().min(1).max(200),
        message: z.string().trim().min(1).max(5000),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    const email = ((context.claims as any).email as string) ?? "unknown@portal";
    const { error } = await context.supabase.from("contact_submissions").insert({
      name: "Portal customer",
      email,
      user_id: context.userId,
      category: `Support: ${data.topic}`,
      subject: data.subject,
      message: data.message,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
