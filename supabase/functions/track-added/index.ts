import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { MPEGDecoder } from "npm:mpg123-decoder";
import { createClient } from "jsr:@supabase/supabase-js@2";
import type { Database } from "../../supabase.types.ts";
import type { Tables } from "../../../src/supabase.types.ts";

type Track = Tables<"tracks">;

type UpdatePayload = {
  type: "UPDATE";
  table: string;
  schema: string;
  record: Track;
  old_record: Track;
};

Deno.serve(async (req) => {
  const body: UpdatePayload = await req.json();

  if (body.old_record.uploaded) {
    return new Response("", { status: 200 });
  }

  const track = body.record;

  const supabaseClient = createClient<Database>(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const res = await supabaseClient.storage.from("uploads").download(
    `${track.user_id}/${track.id}.mp3`,
  );

  if (res.error) {
    console.error(res.error);
    return new Response(res.error.message, {
      status: 500,
    });
  }

  if (!res.data) {
    return new Response("no data", {
      status: 500,
    });
  }

  const buffer = await res.data.arrayBuffer();
  const waveformPreviewData = await getWaveformPreviewData(buffer);

  const result = await supabaseClient
    .from("tracks")
    .update({ preview_data: waveformPreviewData })
    .eq("id", track.id)
    .select();

  if (result.error) {
    return new Response("failed to set preview data", {
      status: 500,
    });
  }

  return new Response("", { status: 200 });
});

const getWaveformPreviewData = async (fileBuffer: ArrayBuffer) => {
  const decoder = new MPEGDecoder();
  await decoder.ready;

  const inputBuffer = new Uint8Array(fileBuffer);

  const { channelData } = decoder.decode(
    inputBuffer,
  );

  const buffer = new Float32Array(channelData[0].length);

  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = (channelData[0][i] + channelData[1][i]) / 2;
  }

  const length = buffer.length;

  const widthPx = 1000;

  const samplesPerWindow = Math.floor(length / widthPx);

  const waveformData = new Uint8Array(widthPx);

  for (let i = 0; i < widthPx; i++) {
    const bufferIndex = i * samplesPerWindow;

    let sum = 0;

    for (let j = 0; j < samplesPerWindow; j++) {
      const sample = buffer[bufferIndex + j];
      sum += sample * sample;
    }

    const s = Math.sqrt(sum / samplesPerWindow);

    waveformData[i] = Math.floor(s * 255);
  }

  normalise(waveformData);

  await decoder.reset();

  decoder.free();

  return Array.from(waveformData);
};

const maxSample = (buffer: Uint8Array) => {
  let max = 0;

  for (let i = 0; i < buffer.length; i++) {
    max = Math.max(max, buffer[i]);
  }

  return max;
};

const normalise = (buffer: Uint8Array, peak = 255) => {
  const max = maxSample(buffer);

  if (max >= peak) return;

  const delta = peak - max;

  for (let i = 0; i < buffer.length; i++) {
    buffer[i] += delta;
  }
};
