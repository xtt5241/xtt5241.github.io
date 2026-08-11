import type { Post, RichTextNode } from "@/types/content";

const text = (value: string, format?: number): RichTextNode => ({ type: "text", text: value, format });
const paragraph = (...children: RichTextNode[]): RichTextNode => ({ type: "paragraph", children });
const heading = (value: string, tag = "h2"): RichTextNode => ({ type: "heading", tag, children: [text(value)] });
const root = (...children: RichTextNode[]): RichTextNode => ({ type: "root", children });

export const fallbackPosts: Post[] = [
  {
    id: "welcome",
    slug: "why-rebuild-this-blog",
    title: "为什么重新做一个个人博客",
    excerpt: "从一个只能在固定设备上维护的静态站，回到写作本身：更轻的前台、更顺手的后台，以及真正可持续的发布流程。",
    publishedAt: "2026-08-11T08:00:00.000Z",
    readingMinutes: 6,
    category: { name: "随笔", slug: "notes" },
    tags: [{ name: "博客", slug: "blog" }, { name: "重构", slug: "refactor" }],
    featured: true,
    content: root(
      paragraph(text("以前的博客有很多我喜欢的东西：一张占满屏幕的图、会动的角色，以及完整的分类和标签。它也有一个很现实的问题：每次写点东西，都要先回到固定设备、打开项目、记起命令，再走一遍构建和发布。")),
      heading("把注意力还给内容"),
      paragraph(text("这次重构不追求更多效果，而是减少写作之前的阻力。前台负责阅读体验，后台负责内容、图片、草稿与发布。只要能打开浏览器，就能继续一篇没写完的文章。")),
      heading("简约不等于空白", "h2"),
      paragraph(text("真正的简约，是每个元素都有任务：导航让人快速找到文章，摘要帮助判断是否值得阅读，时间线保留写作轨迹，视觉素材则负责留下属于个人的气味。"))
    ),
  },
  {
    id: "rcnn",
    slug: "r-cnn-notes",
    title: "从 R-CNN 到 Fast R-CNN：目标检测笔记",
    excerpt: "整理候选区域、特征提取、分类与边框回归之间的关系，并记录从 R-CNN 到 Fast R-CNN 的关键变化。",
    publishedAt: "2024-05-19T08:00:00.000Z",
    readingMinutes: 9,
    category: { name: "计算机视觉", slug: "computer-vision" },
    tags: [{ name: "目标检测", slug: "object-detection" }, { name: "深度学习", slug: "deep-learning" }],
    featured: false,
    content: root(
      paragraph(text("R-CNN 把目标检测拆成候选区域生成、深度特征提取、分类和边框修正四个阶段。这个思路奠定了两阶段检测器的基本框架。")),
      heading("R-CNN 的流程"),
      paragraph(text("Selective Search 先生成候选区域，每个区域分别经过卷积网络提取特征，再交给分类器和回归器。准确率得到提升，但重复计算使训练与推理都很慢。")),
      heading("Fast R-CNN 的改变"),
      paragraph(text("Fast R-CNN 先对整张图计算一次特征图，再通过 ROI Pooling 为不同候选框得到固定尺寸的特征，从而显著减少重复计算。"))
    ),
  },
  {
    id: "cmake",
    slug: "cmake-practical-guide",
    title: "CMake 实用入门：从构建到依赖管理",
    excerpt: "不从命令大全开始，而是用一个小项目理解 target、依赖关系和跨平台构建。",
    publishedAt: "2024-05-04T08:00:00.000Z",
    readingMinutes: 12,
    category: { name: "工程实践", slug: "engineering" },
    tags: [{ name: "CMake", slug: "cmake" }, { name: "C++", slug: "cpp" }],
    featured: false,
    content: root(
      paragraph(text("CMake 是构建系统的生成器。真正需要理解的不是记住多少命令，而是把可执行程序、库和它们的依赖关系表达清楚。")),
      heading("从 target 开始"),
      paragraph(text("现代 CMake 以 target 为中心。头文件路径、编译选项和链接依赖都应该附着在 target 上，并通过 PUBLIC、PRIVATE、INTERFACE 描述传播边界。"))
    ),
  },
  {
    id: "ffmpeg",
    slug: "ffmpeg-command-notes",
    title: "FFmpeg 常用命令与背后的媒体概念",
    excerpt: "把容器、编码、码流和常用参数放在一起理解，减少只会复制命令却不知道为何生效的情况。",
    publishedAt: "2024-05-01T08:00:00.000Z",
    readingMinutes: 8,
    category: { name: "音视频", slug: "av" },
    tags: [{ name: "FFmpeg", slug: "ffmpeg" }, { name: "音视频", slug: "media" }],
    featured: false,
    content: root(
      paragraph(text("MP4 是容器，H.264 是视频编码。使用 copy 参数意味着复制已有码流而不重新编码，速度快，也不会引入额外画质损失。")),
      heading("先判断是否需要转码"),
      paragraph(text("只改变封装格式时优先尝试码流复制；只有目标设备不支持原编码、需要改变分辨率或码率时，才进行重新编码。"))
    ),
  },
];
