import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      name: z.string().min(1).max(200),
      email: z.string().email().max(320),
      subject: z.string().max(200).optional().nullable(),
      message: z.string().min(1).max(5000),
      category: z.string().max(80).optional().nullable(),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("contact_submissions").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ email: z.string().email().max(320) }).parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .upsert({ email: data.email }, { onConflict: "email" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
