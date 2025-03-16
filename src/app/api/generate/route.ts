import { generateArticle } from "@/lib/openai";
import { NextResponse } from "next/server";

// 设置API路由配置
export const config = {
  api: {
    // 延长超时限制
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: false,
  },
};

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();

    if (!topic || typeof topic !== "string") {
      return new NextResponse(
        JSON.stringify({ error: "请提供有效的主题" }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const articleData = await generateArticle(topic);
    
    // 检查是否有错误响应
    if (articleData.title === "生成失败") {
      // 如果生成失败，返回错误状态和详细信息
      return new NextResponse(
        JSON.stringify({ 
          error: "生成文章失败", 
          message: articleData.content,
          title: articleData.title,
          content: articleData.content 
        }),
        { 
          status: 200, // 依然使用200状态码，但包含错误信息
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new NextResponse(
      JSON.stringify(articleData),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in generate API:", error);
    
    // 获取更详细的错误信息
    let errorMessage = "未知错误";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      try {
        errorMessage = JSON.stringify(error);
      } catch {
        errorMessage = "无法序列化的错误对象";
      }
    }
    
    return new NextResponse(
      JSON.stringify({ 
        error: "生成文章失败，请重试", 
        message: errorMessage,
        title: "生成失败",
        content: `生成文章时出错，错误原因：${errorMessage}。请确保API密钥有效并重试。`
      }),
      { 
        status: 200, // 使用200状态码而不是500，避免前端无法获取详细信息
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 