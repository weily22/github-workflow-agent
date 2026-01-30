------

# GitHub Workflow Agent (MCP Server)

这是一个基于 **Model Context Protocol (MCP)** 构建的自动化 GitHub 协作专家。它不仅能阅读代码，还能像经验丰富的架构师一样，完成从**代码审查、自动修复、状态监控到最终合并**的全生命周期管理。

核心业务流程：AI 驱动的交付闭环

该工具集将传统的手动流程转化为智能的自动流：

1. **深度审查**：AI 自动抓取 PR Diff，结合上下文生成详尽的《AI 代码审查报告》。
2. **交互修复**：开发者一句话指令，AI 自动完成“读源码-写补丁-提提交”的复杂动作。
3. **质量关卡**：在合并前，AI 会主动检查 GitHub Actions 状态，确保不合并“坏代码”。
4. **归档合并**：确认无误后，AI 执行合并，清理分支。

核心工具集 (Core Tools)

| **工具名称**        | **功能描述**                                      | **业务阶段** |
| ------------------- | ------------------------------------------------- | ------------ |
| `get_pr_diff`       | 获取 Pull Request 的代码差异文本。                | **深度审查** |
| `add_pr_comment`    | 在 GitHub PR 页面发表审查结论。                   | **建议报告** |
| `get_file_contents` | 获取指定文件的源码及其 SHA 值（用于更新）。       | **互动修复** |
| `github_write_file` | 提交修复代码到指定分支。                          | **互动修复** |
| `get_workflow_runs` | 实时监控 GitHub Actions CI 状态。（是否通过测试） | **质量关卡** |
| `merge_pr`          | 最终合并代码                                      | **归档合并** |

📦 安装与配置

1. 前置要求：

* 获取一个 [GitHub Personal Access Token](https://github.com/settings/tokens)。

* 权限要求：`repo` (或 `contents:write`, `pull_requests:write`, `issues:write`, `actions:read`)。

2. 接入 MCP 客户端 以 **Claude Code** 为例：

   ```bash
   claude mcp add github-workflow-agent -- node /绝对路径/dist/index.js
   ```

   




