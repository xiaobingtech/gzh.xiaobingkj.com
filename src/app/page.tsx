"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function Home() {
  const [topic, setTopic] = useState<string>("");
  const [articleContent, setArticleContent] = useState<string>("");
  const [articleTitle, setArticleTitle] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function handleGenerate() {
    if (!topic.trim()) {
      alert("请输入文章主题");
      return;
    }

    setIsGenerating(true);
    setCopySuccess("");
    setErrorMessage("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      });

      // 检查响应状态
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API错误响应:", errorText);
        setErrorMessage(`服务器错误 (${response.status}): ${errorText.substring(0, 100)}${errorText.length > 100 ? '...' : ''}`);
        setIsGenerated(false);
        return;
      }

      // 检查内容类型头
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errorText = await response.text();
        console.error("非JSON响应:", errorText);
        setErrorMessage(`服务器返回了非JSON格式数据: ${errorText.substring(0, 100)}${errorText.length > 100 ? '...' : ''}`);
        setIsGenerated(false);
        return;
      }

      // 现在我们确认响应是JSON格式的
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("JSON解析错误:", jsonError);
        const errorText = await response.text().catch(() => "无法读取响应内容");
        setErrorMessage(`无法解析服务器响应: ${errorText.substring(0, 100)}${errorText.length > 100 ? '...' : ''}`);
        setIsGenerated(false);
        return;
      }
      
      if (data.error) {
        setErrorMessage(data.message || data.content || "生成文章失败，请重试");
        setIsGenerated(false);
        return;
      }

      setArticleContent(data.content);
      setArticleTitle(data.title);
      setIsGenerated(true);
    } catch (error) {
      console.error("Error generating article:", error);
      // 更详细的错误信息
      let detailedError = "生成文章失败，请重试";
      if (error instanceof Error) {
        if (error.message.includes("Unexpected token")) {
          detailedError = "服务器返回了格式错误的数据，这可能是由于服务器超时或内部错误导致的";
        } else {
          detailedError = error.message;
        }
      }
      setErrorMessage(detailedError);
      setIsGenerated(false);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleDownload() {
    if (!articleContent) return;

    try {
      // Convert Markdown to HTML
      fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: articleContent }),
      })
        .then((response) => response.json())
        .then((data) => {
          // Create a Blob with the HTML content
          const blob = new Blob([data.html], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          
          // Create a temporary link to download the file
          const link = document.createElement("a");
          link.href = url;
          link.download = `${articleTitle}_${new Date().toLocaleString("zh-CN").replace(/[/:]/g, "_")}.html`;
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          URL.revokeObjectURL(url);
          document.body.removeChild(link);
        });
    } catch (error) {
      console.error("Error downloading article:", error);
      alert("下载文章失败，请重试");
    }
  }

  const handleCopyArticle = () => {
    navigator.clipboard.writeText(articleTitle)
      .then(() => {
        setCopySuccess("已复制到剪贴板");
        setTimeout(() => setCopySuccess(""), 2000);
      })
      .catch(err => {
        console.error('复制失败:', err);
        setCopySuccess("复制失败");
      });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">微信公众号爆款文章生成器</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4 mb-8">
            <div className="space-y-2">
              <Label htmlFor="topic">文章主题</Label>
              <Input
                id="topic"
                placeholder="请输入文章主题，如：中年婚姻、职场困境、亲子关系等"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full"
            >
              {isGenerating ? "生成中..." : "开始生成"}
            </Button>
          </div>

          {errorMessage && (
            <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
              <p className="font-medium">生成失败</p>
              <p className="text-sm mt-1">{errorMessage}</p>
            </div>
          )}

          {isGenerating && (
            <div className="text-center py-20">
              <div className="animate-pulse text-xl">生成文章中，请稍候...</div>
            </div>
          )}

          {isGenerated && !isGenerating && (
            <div className="border rounded-lg p-6 bg-white dark:bg-gray-950 space-y-4">
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">{articleTitle}</h2>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCopyArticle}
                      variant="outline"
                      size="sm"
                    >
                      {copySuccess || "复制标题"}
                    </Button>
                    <Button onClick={handleDownload} size="sm">下载 HTML</Button>
                  </div>
                </div>
                <div className="h-0.5 bg-gray-200 dark:bg-gray-700 w-full"></div>
              </div>
              
              <div className="prose dark:prose-invert max-w-none">
                {articleContent.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-wrap">
                    {paragraph.replace(/\*\*(.*?)\*\*/g, (_, content) => (
                      `<strong style="color: #006ddb;">${content}</strong>`
                    ))}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} 微信公众号爆款文章生成器 - 生成高质量的公众号文章
        </div>
      </footer>
    </div>
  );
}
