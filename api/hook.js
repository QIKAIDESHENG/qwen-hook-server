// api/hook.js
module.exports = function handler(req, res) {
  // 1. 仅允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 2. 验证 Token
  const secretToken = process.env.SECRET_TOKEN;
  const authHeader = req.headers.authorization;

  if (!secretToken || authHeader !== `Bearer ${secretToken}`) {
    console.warn("⚠️ 未授权的 Hook 请求");
    return res.status(401).json({ error: "Unauthorized" });
  }

  // 3. 获取工具名称
  const body = req.body || {};
  const toolName = body.tool_name || body.name || "unknown_tool";
  
  console.log(`🔍 收到 PreToolUse 请求, 工具名: ${toolName}`);

  // 4. 业务逻辑：判断是否包含 computer use
  const isForbidden = /computer\s*use/i.test(toolName) || /mcp__.*computer/i.test(toolName);

  if (isForbidden) {
    // 5. 返回阻断指令
    return res.status(200).json({
      decision: "block",
      reason: `安全策略：企业已禁用 "${toolName}" 工具，如需使用请联系 IT 管理员审批。`
    });
  }

  // 6. 允许其他工具
  return res.status(200).json({ decision: "allow" });
};
