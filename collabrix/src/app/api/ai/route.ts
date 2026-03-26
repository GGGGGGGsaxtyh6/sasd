import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { aiSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = aiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { action, content, context } = parsed.data;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey.startsWith("sk-placeholder")) {
      const result = generateFallbackResponse(action, content);
      return new Response(result, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const systemPrompts: Record<string, string> = {
      summarize: "You are an expert summarizer. Provide a clear, concise summary of the given content. Use bullet points for key takeaways.",
      rewrite: "You are a professional editor. Rewrite the given content to improve clarity, flow, and impact while preserving the meaning.",
      generate: "You are a creative content generator. Generate well-structured content based on the given prompt. Be detailed and professional.",
      classify: "You are a content classifier. Analyze the content and provide: 1) Main topics/themes, 2) Sentiment, 3) Category suggestions, 4) Key entities mentioned.",
      ask: "You are a knowledgeable assistant. Answer questions about the workspace content accurately. Use the provided context to give relevant answers.",
    };

    const messages = [
      { role: "system" as const, content: systemPrompts[action] },
      ...(context ? [{ role: "user" as const, content: `Context:\n${context}` }] : []),
      { role: "user" as const, content },
    ];

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        stream: true,
      }),
    });

    if (!openaiResponse.ok) {
      const err = await openaiResponse.text();
      console.error("OpenAI error:", err);
      const result = generateFallbackResponse(action, content);
      return new Response(result, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const reader = openaiResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const json = JSON.parse(data);
              const text = json.choices?.[0]?.delta?.content;
              if (text) {
                controller.enqueue(encoder.encode(text));
              }
            } catch {}
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("AI error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function generateFallbackResponse(action: string, content: string): string {
  const contentPreview = content.substring(0, 200);

  switch (action) {
    case "summarize":
      return `## Summary\n\nThis content discusses the following key points:\n\n- **Main topic**: ${contentPreview}...\n- The content contains ${content.split(/\s+/).length} words\n- Key themes have been identified and organized\n\n> Note: Connect an OpenAI API key for AI-powered summaries.`;
    case "rewrite":
      return `## Rewritten Version\n\n${content}\n\n---\n*This is a placeholder rewrite. Connect an OpenAI API key for AI-powered rewrites.*`;
    case "generate":
      return `## Generated Content\n\nBased on your prompt: "${contentPreview}..."\n\n### Section 1\nHere is the beginning of your generated content. This section introduces the main ideas and sets the context for the reader.\n\n### Section 2\nThis section expands on the core concepts, providing details and examples.\n\n### Section 3\nIn conclusion, the key takeaways are summarized here.\n\n---\n*Connect an OpenAI API key for AI-powered content generation.*`;
    case "classify":
      return `## Classification Results\n\n- **Category**: General Content\n- **Sentiment**: Neutral\n- **Word Count**: ${content.split(/\s+/).length}\n- **Topics**: Content analysis, Text processing\n\n---\n*Connect an OpenAI API key for AI-powered classification.*`;
    case "ask":
      return `Based on the available context, here's what I can tell you:\n\nYour question relates to the workspace content. The content contains ${content.split(/\s+/).length} words of text.\n\n---\n*Connect an OpenAI API key for AI-powered Q&A.*`;
    default:
      return "Action not recognized.";
  }
}
