import { convertToHtml } from "@/lib/openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供有效的文章内容" },
        { status: 400 }
      );
    }

    const html = convertToHtml(content);

    return NextResponse.json({ html });
  } catch (error) {
    console.error("Error in download API:", error);
    return NextResponse.json(
      { error: "转换HTML失败，请重试" },
      { status: 500 }
    );
  }
} 