import { generateArticle } from "@/lib/openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "请提供有效的主题" },
        { status: 400 }
      );
    }

    const articleData = await generateArticle(topic);

    return NextResponse.json(articleData);
  } catch (error) {
    console.error("Error in generate API:", error);
    return NextResponse.json(
      { error: "生成文章失败，请重试" },
      { status: 500 }
    );
  }
} 