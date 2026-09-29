import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Forbidden: admin access required");
}

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const s = context.supabase;
    const count = async (t: string, f?: (q: any) => any) => {
      let q: any = (s as any).from(t).select("id", { count: "exact", head: true });
      if (f) q = f(q);
      const { count } = await q;
      return count ?? 0;
    };
    const [customers, products, pendingAccess, pendingRequests, inquiries] = await Promise.all([
      count("profiles"),
      count("products"),
      count("access_requests", (q) => q.eq("status", "pending")),
      count("product_requests", (q) => q.in("status", ["pending", "under_review"])),
      count("contact_submissions", (q) => q.eq("status", "new")),
    ]);
    const [{ data: recentCustomers }, { data: recentRequests }, { data: recentAccess }] = await Promise.all([
      s.from("profiles").select("id,first_name,last_name,company,created_at").order("created_at", { ascending: false }).limit(5),
      s.from("product_requests").select("id,status,created_at,products(name)").order("created_at", { ascending: false }).limit(5),
      s.from("access_requests").select("id,first_name,last_name,company,created_at").order("created_at", { ascending: false }).limit(5),
    ]);
    return { customers, products, pendingAccess, pendingRequests, inquiries, recentCustomers: recentCustomers ?? [], recentRequests: recentRequests ?? [], recentAccess: recentAccess ?? [] };
  });

export const adminProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("products")
      .select("id,slug,name,sku,product_type,availability,status,short_desc,long_desc,scientific_info,therapeutic_info,images,category_id,created_at,updated_at,categories(name)")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const productInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(160),
  sku: z.string().trim().max(60).nullable(),
  category_id: z.string().uuid().nullable(),
  product_type: z.string().trim().max(80),
  availability: z.string().trim().max(60),
  short_desc: z.string().max(500).nullable(),
  long_desc: z.string().max(10000).nullable(),
  scientific_info: z.string().max(10000).nullable(),
  therapeutic_info: z.string().max(10000).nullable(),
  image_url: z.string().max(1000).nullable(),
  status: z.enum(["draft", "active", "archived"]),
});

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => productInput.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, image_url, ...rest } = data;
    const slug = rest.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
    const payload: any = { ...rest, ...(image_url ? { images: [image_url] } : {}) };
    if (id) {
      const { error } = await context.supabase.from("products").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("products")
      .insert({ ...payload, slug: `${slug}-${Date.now().toString(36)}`, price_cents: 0 })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const setProductStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid(), status: z.enum(["draft", "active", "archived"]) }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("products").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminProductDocs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ productId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: docs } = await context.supabase.from("product_documents").select("*").eq("product_id", data.productId);
    return docs ?? [];
  });

export const addProductDoc = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({ productId: z.string().uuid(), title: z.string().min(1).max(200), doc_type: z.string().max(80), file_path: z.string().min(1).max(500) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("product_documents")
      .insert({ product_id: data.productId, title: data.title, doc_type: data.doc_type, file_path: data.file_path });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProductDoc = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: doc } = await context.supabase.from("product_documents").select("file_path").eq("id", data.id).maybeSingle();
    if (doc) await context.supabase.storage.from("product-docs").remove([doc.file_path]);
    await context.supabase.from("product_documents").delete().eq("id", data.id);
    return { ok: true };
  });

export const adminCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data: profiles } = await context.supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const emails = new Map<string, string>();
    try {
      const { data } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      data?.users.forEach((u) => emails.set(u.id, u.email ?? ""));
    } catch (e) {
      console.error(e);
    }
    return (profiles ?? []).map((p: any) => ({ ...p, email: emails.get(p.id) ?? "" }));
  });

export const adminAccessRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data } = await context.supabase.from("access_requests").select("*").order("created_at", { ascending: false });
    return data ?? [];
  });

export const setAccessStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid(), status: z.enum(["pending", "approved", "rejected"]) }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("access_requests").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminProductRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data } = await context.supabase
      .from("product_requests")
      .select("id,user_id,status,message,admin_note,created_at,updated_at,products(name)")
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const setRequestStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({ id: z.string().uuid(), status: z.enum(["pending", "under_review", "approved", "completed", "rejected"]) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("product_requests")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminInquiries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data } = await context.supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
    return data ?? [];
  });

export const setInquiryStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid(), status: z.enum(["new", "in_progress", "closed"]) }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    await context.supabase.from("contact_submissions").update({ status: data.status }).eq("id", data.id);
    return { ok: true };
  });

export const adminResources = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data } = await context.supabase.from("resources").select("*").order("published_at", { ascending: false });
    return data ?? [];
  });

export const saveResource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        id: z.string().uuid().optional(),
        title: z.string().trim().min(1).max(200),
        category: z.string().max(80),
        excerpt: z.string().max(500).nullable(),
        body: z.string().max(20000).nullable(),
        published: z.boolean(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...rest } = data;
    if (id) {
      const { error } = await context.supabase.from("resources").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const slug = rest.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80) + "-" + Date.now().toString(36);
      const { error } = await context.supabase.from("resources").insert({ ...rest, slug });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteResource = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    await context.supabase.from("resources").delete().eq("id", data.id);
    return { ok: true };
  });
