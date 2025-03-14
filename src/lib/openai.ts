import OpenAI from "openai";

// Initialize the OpenAI client
const openai = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Allow usage in browser
});

export async function generateArticle(topic: string): Promise<{ content: string; title: string }> {
  try {
    const systemPrompt = `Role: 专业情感类公众号爆文创作专家
Background: 用户需要为微信公众号创作引人入胜的爆款文章，期望文章能够引发读者共鸣，获得高阅读量和转发量，提高公众号影响力和粉丝黏性。
Profile: 你是一位在自媒体内容创作领域拥有多年经验的资深写手，精通情感类故事创作、人物塑造、叙事结构设计以及爆款标题制作，擅长捕捉读者心理需求，能够将日常情感故事转化为引人入胜的爆款内容，精准把握用户痛点，将情感冲突与共鸣点完美融合。
Skills: 你具备以下关键能力：1) 精通情感类爆款文章创作技巧，能够快速构建有冲突感的故事情节；2) 深谙读者心理，懂得如何通过文章内容引发目标读者共鸣；3) 拥有出色的标题制作能力，能够撰写吸引眼球的爆款标题；4) 熟悉不同风格的叙事手法，能够根据主题选择合适的表达方式。
Goals: 创作高质量的情感类爆款文章，确保文章在情节上跌宕起伏，人物形象生动立体，文案内容精准戳中读者痛点，引发情感共鸣，提升文章阅读量和转发量，促进公众号粉丝增长。
Constrains: 文章创作需遵循微信平台内容规范，确保内容积极健康；叙事需自然流畅，语言口语化亲民，避免过于文艺或学术化；文章整体风格需符合目标读者群体的阅读习惯。文章长度必须在1000-1500字之间，不要太短。没有任何编辑注释，如【开头：悬念式切入】这样的文字。
OutputFormat: 你的回复应该是一个JSON格式的对象，包含两个字段：title和content。title是一个吸引眼球的文章标题，content是文章的正文内容，包含引人入胜的开头、有冲突感的正文内容、情感升华的结尾，以及适当的排版与分段。不要在正文中包含标题。内容篇幅要足够长，达到1000-1500字。
Workflow:
1. 确定文章的核心主题和目标受众，包括情感冲突点、人物设定、故事背景等。
2. 创作吸引眼球的标题，确保标题具有冲突感和好奇心驱动力。
3. 构建故事情节，确保开头吸引人，中间冲突明显，结尾有反转或情感升华。
4. 对文章进行优化，调整叙事节奏、人物对话和情感描写，确保文章符合公众号爆款的风格要求，并且达到1000-1500字的长度要求。
Examples:
例子1: 标题《领导一声不吭把我调走，以为要被穿小鞋，结果却捡了大便宜！》
文章设计：采用第一人称叙述，塑造一个普通职场人物形象，通过意外调岗引发的情感起伏，展现职场中的无奈与惊喜，文章通过细腻的心理描写和情节反转，引发读者对职场不确定性的共鸣。
例子2: 标题《28岁，我花光积蓄买了套房，谁知道竟成了最大失误》
文章设计：以90后年轻人为主角，讲述购房后遇到的各种意外问题，通过生活困境的描述，引发年轻人对房产投资风险的思考，文案强调决策失误带来的教训与成长。
例子3: 标题《妻子手机掉了，我帮她回复微信，看到一条消息后我浑身发抖》
文章设计：以婚姻关系为背景，构建信任危机的情感冲突，通过发现疑似出轨消息引发的心理变化，展现婚姻关系中的猜疑与误会，最终通过真相揭晓带来情感释放。

在文章中每个段落强调一个点睛句子（加粗处理）。文章必须足够长，达到1000-1500字的长度。内容要丰富，场景描写要详细，情感描写要充分。
记住，你的回复必须是一个JSON格式的对象，包含title和content两个字段。不要在回复中包含任何其他内容。`;

    const userPrompt = `请根据主题"${topic}"创作一篇爆款文章，要求每个段落都强调一个点睛句子，文章长度必须在1000-1500字之间，并且以JSON格式返回，包含title和content两个字段。`;

    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 3000,
    });

    const responseText = response.choices[0]?.message?.content || '{"title":"生成失败","content":"无法生成文章，请重试。"}';
    let result;
    
    try {
      // Try to parse the response as JSON
      result = JSON.parse(responseText);
    } catch (error) {
      // If parsing fails, create a structured response
      console.error("Failed to parse JSON response:", error);
      
      // Try to extract a title if it exists in the response
      const titleMatch = responseText.match(/《(.*?)》/) || ["", "精彩文章"];
      const extractedTitle = titleMatch[1];
      
      // Create a structured response with the content without any potential title
      result = {
        title: extractedTitle,
        content: responseText.replace(/^#\s+(.+)$/m, "").trim() // Remove any markdown title format
      };
    }

    return result;
  } catch (error) {
    console.error("Error generating article:", error);
    return {
      title: "生成失败",
      content: "生成文章时出错，请确保API密钥有效并重试。"
    };
  }
}

export function convertToHtml(content: string): string {
  // Split by paragraphs and wrap each in a div with class "content"
  const paragraphs = content.split(/\n{2,}/);
  const htmlParagraphs = paragraphs
    .filter(p => p.trim())
    .map(paragraph => {
      // Check if paragraph is an image markdown
      if (paragraph.trim().match(/^!\[.*\]\(.*\)$/)) {
        return `<div class="content"><p>${paragraph}</p></div>`;
      }
      
      // Handle strong emphasis (bold text)
      const formattedParagraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      return `<div class="content"><p>${formattedParagraph}</p></div>`;
    })
    .join("\n");

  const htmlTemplate = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <style>
                            body {
                                font-family: 微软雅黑;
                                font-size: 17px;
                                margin: 20px;
                                line-height: 2;
                                letter-spacing: 1px;
                            }
                            p {
                                padding-left: 8px;
                                padding-right: 8px;
                                margin-top: 24px;
                                margin-bottom: 0;
                            }
                            .content strong {
                                color: #006ddb;
                            }
                            .h2-template strong {
                                color: inherit;
                            }
                        </style>
                    </head>
                    <body>
                        <section class="_editor" style="margin-bottom:unset;"><p><img src="https://img.96weixin.com/ueditor/20240504/1714833409545828.gif" alt="可爱猫爪GIF动态引导在看.gif" style="vertical-align:bottom;"></p></section>
                        ${htmlParagraphs}

                        <section class="_editor" data-support="96编辑器" data-style-id="14294" style="margin-bottom:unset;"><section style="margin:10px 0%;box-sizing:border-box;"><section style="display:inline-block;width:100%;vertical-align:top;border-bottom:1px dashed rgb(0, 82, 255);border-bottom-right-radius:0px;border-right:1px dashed rgb(0, 82, 255);border-top-right-radius:0px;border-left-width:0px;box-sizing:border-box;margin-bottom:unset;" data-width="100%"><section style="box-sizing:border-box;margin-bottom:unset;"><section style="margin-right:0%;margin-bottom:10px;margin-left:0%;box-sizing:border-box;"><section style="display:inline-block;width:96%;border-color:rgb(0, 82, 255);border-style:solid;border-width:1px 0px 0px 10px;padding-right:10px;padding-left:10px;box-shadow:rgb(0, 0, 0) 0px 0px 0px;border-radius:0px;box-sizing:border-box;margin-bottom:unset;" data-width="96%"><section style="box-sizing:border-box;margin-bottom:unset;"><section style="margin-top:10px;margin-right:0%;margin-left:0%;box-sizing:border-box;margin-bottom:unset;"><section style="box-sizing:border-box;margin-bottom:unset;"><p>往期回顾</p></section></section></section></section></section></section><section style="box-sizing:border-box;margin-bottom:unset;"><section style="box-sizing:border-box;margin-bottom:unset;"><section style="display:inline-block;width:100%;vertical-align:top;padding:2px 10px;box-sizing:border-box;margin-bottom:unset;" data-width="100%"><section style="box-sizing:border-box;margin-bottom:unset;"><section style="margin:8px 0%;box-sizing:border-box;"><section style="font-size:13px;color:rgb(62, 62, 62);box-sizing:border-box;margin-bottom:unset;"><p>1.</p></section></section></section><section style="box-sizing:border-box;margin-bottom:unset;"><section style="margin:8px 0%;box-sizing:border-box;"><section style="font-size:13px;color:rgb(62, 62, 62);box-sizing:border-box;margin-bottom:unset;"><p>2.</p></section></section></section><section style="box-sizing:border-box;margin-bottom:unset;"><section style="margin:8px 0%;box-sizing:border-box;"><section style="font-size:13px;color:rgb(62, 62, 62);box-sizing:border-box;margin-bottom:unset;"><p>3.</p></section></section></section></section></section></section></section></section></section><section class="_editor" style="margin-bottom:unset;"><p><img src="https://img.96weixin.com/ueditor/20240507/17150500881715050088944885.gif" style="vertical-align:bottom;"></p></section>
                    </body>
                    </html>
  `;

  return htmlTemplate;
} 