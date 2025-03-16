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

  async function handleGenerate() {
    if (!topic.trim()) {
      alert("请输入文章主题");
      return;
    }

    setIsGenerating(true);
    setCopySuccess("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = await response.json();
      setArticleContent(data.content);
      setArticleTitle(data.title);
      setIsGenerated(true);
    } catch (error) {
      console.error("Error generating article:", error);
      alert("生成文章失败，请重试");
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
