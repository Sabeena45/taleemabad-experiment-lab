import { NextResponse } from "next/server";

// POST /api/transcribe — Convert audio to text
// For now, returns a placeholder. In production, integrate with OpenAI Whisper API.
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Placeholder: In production, send to OpenAI Whisper API
    // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // const transcription = await openai.audio.transcriptions.create({
    //   file: audioFile,
    //   model: "whisper-1",
    // });
    // return NextResponse.json({ text: transcription.text });

    return NextResponse.json({
      text: "[Voice transcription will be available when OpenAI API key is configured. Please type your response instead.]",
    });
  } catch (error) {
    console.error("Transcription failed:", error);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
