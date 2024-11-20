import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  const body = await req.json();

  console.log(body);

  return new Response("", { status: 200 });
});
