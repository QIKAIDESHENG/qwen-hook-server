// api/hook.js
// Vercel 会自动注入 process.env 中的环境变量

export default function handler(req, res) {
  // 1. 仅允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 2. 验证 Token (从环境变量中读取，确保安全)
  const secretToken = process.env.SECRET_TOKEN;
  const authHeader = req.headers.authorization;

  if (!secretToken || authHeader !== `Bearer ${secretToken}`) {
    console.warn("⚠️ 未授权的 Hook 请求");
    return res.status(401).json({ error: "Unauthorized" });
  }

  // 3. 获取工具名称 (兼容不同的字段名)
  const body = req.body || {};
  const toolName = body.tool_name || body.name || "unknown_tool";
  
  console.log(`🔍 收到 PreToolUse 请求, 工具名: ${toolName}`);

  // 4. 业务逻辑：判断是否包含 computer use (不区分大小写)
  const isForbidden = /computer\s*use/i.test(toolName) || /mcp__.*computer/i.test(toolName);

  if (isForbidden) {
    // 5. 返回阻断指令
    return res.status(200).json({
      decision: "block",
      reason: `安全策略：企业已禁用 "${toolName}" 工具，如需使用请联系 IT 管理员审批。`
    });
  }

  // 6. 允许其他工具正常执行
  return res.status(200).json({ decision: "allow" });
}
