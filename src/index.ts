import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});
const server = new McpServer({
    name: "github-workflow-tools",
    version: "1.0.0",
});
server.tool(
    "get_pr_diff",
    { owner: z.string(), repo: z.string(), pull_number: z.number() },
    {
        description: "获取指定 PR 的代码差异。当你需要进行代码审计、查找 Bug 或理解代码变更逻辑时，必须先调用此工具。",
    },
    async ({ owner, repo, pull_number }) => {
        try {
            const { data } = await octokit.pulls.get({
                owner, repo, pull_number,
                mediaType: { format: "diff" }
            });
            return { content: [{ type: "text", text: String(data) }] };
        } catch (error: any) {
            return { isError: true, content: [{ type: "text", text: `GitHub API 错误: ${error.message}` }] };
        }

    }
)
server.tool(
    "add_pr_comment",
    { owner: z.string(), repo: z.string(), pull_number: z.number(), report: z.string() },
    async ({ owner, repo, pull_number, report }) => {
        await octokit.issues.createComment({
            owner, repo, issue_number: pull_number,
            body: `### 🤖 AI Code Review Report\n\n${report}`
        });
        return { content: [{ type: "text", text: "报告已同步至 GitHub PR 评论区" }] };
    }
)
server.tool(
    "get_file_contents",
    { owner: z.string(), repo: z.string(), path: z.string(), ref: z.string() },
    async ({ owner, repo, path, ref }) => {
        const { data } = await octokit.repos.getContent({ owner, repo, path, ref }) as any;
        return {
            content: [{ type: "text", text: JSON.stringify({
                    sha: data.sha,
                    content: Buffer.from(data.content, 'base64').toString('utf-8')
                }) }]
        };
    }
)
//互动修复-提交修复代码
server.tool(
    "github_write_file",
    {
        owner: z.string(), repo: z.string(), path: z.string(),
        content: z.string(), message: z.string(), branch: z.string(), sha: z.string()
    },
    async ({ owner, repo, path, content, message, branch, sha }) => {
        await octokit.repos.createOrUpdateFileContents({
            owner, repo, path, message,
            content: Buffer.from(content).toString("base64"),
            branch, sha
        });
        return { content: [{ type: "text", text: `补丁已提交至分支: ${branch}` }] };
    }
)
server.tool(
    "get_workflow_runs",
    {
        owner: z.string(),
        repo: z.string(),
        branch: z.string().optional().describe("可选：检查特定分支的 CI 状态"),
    },
    async ({ owner, repo, branch }) => {
        try {
            const { data } = await octokit.actions.listWorkflowRunsForRepo({
                owner,
                repo,
                branch,
                per_page: 5, // 只看最近的 5 条记录
            });

            const summary = data.workflow_runs.map(run => ({
                name: run.name,
                status: run.status,      // 如: completed, in_progress
                conclusion: run.conclusion, // 如: success, failure, timed_out
                url: run.html_url,
                created_at: run.created_at
            }));

            return {
                content: [{
                    type: "text",
                    text: `最近的 CI 运行状态:\n${JSON.stringify(summary, null, 2)}`
                }]
            };
        } catch (error: any) {
            return {
                isError: true,
                content: [{ type: "text", text: `获取工作流状态失败: ${error.message}` }]
            };
        }
    }
)
server.tool(
    "merge_pr",
    { owner: z.string(), repo: z.string(), pull_number: z.number() },
    async ({ owner, repo, pull_number }) => {
        await octokit.pulls.merge({ owner, repo, pull_number });
        return { content: [{ type: "text", text: "🚀 任务完成，PR 已成功合并！" }] };
    }
)
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("GitHub MCP Server 正在通过 Stdio 运行...");
}
main().catch((error) => {
    console.error("启动失败:", error);
    process.exit(1);
});
