/**
 * API 格式映射工具
 *
 * 统一管理不同格式命名之间的映射关系：
 * - Client Format（路由检测到的格式）→ Transformer Format（转换器使用的格式）
 * - Provider Type（数据库中的类型）→ Transformer Format
 *
 * 背景：
 * - session.originalFormat 使用旧的命名: "response" | "openai" | "claude" | "gemini-cli"
 * - 转换器使用新的 Format 类型: "codex" | "openai-compatible" | "claude" | "gemini-cli"
 * - provider.providerType 使用数据库类型: "codex" | "openai-compatible" | "claude" | "gemini-cli"
 *
 * 此文件提供统一的映射函数，避免在多个地方重复映射逻辑。
 */

import type { Format } from "../converters/types";
import type { ProviderType } from "@/types/provider";

/**
 * Client Format（路由层检测到的请求格式）
 *
 * 这些值来自路由层的格式检测逻辑：
 * - "response": 检测到 Response API 格式（Codex）的请求（通过 `input` 字段）
 * - "openai": 检测到 OpenAI Chat Completions 格式的请求（通过 `messages` 字段）
 * - "claude": 检测到 Claude Messages API 格式的请求（通过 `system` 或 Claude 特有字段）
 * - "gemini-cli": 检测到 Gemini CLI 格式的请求（通过 `request` envelope）
 */
export type ClientFormat = "response" | "openai" | "claude" | "gemini-cli";

/**
 * 将 Client Format 映射到 Transformer Format
 *
 * @param clientFormat - 路由层检测到的格式
 * @returns 转换器使用的格式
 */
export function mapClientFormatToTransformer(clientFormat: ClientFormat): Format {
  switch (clientFormat) {
    case "response":
      return "codex";
    case "openai":
      return "openai-compatible";
    case "claude":
      return "claude";
    case "gemini-cli":
      return "gemini-cli";
    default:
      // 类型守卫：如果有未处理的格式，TypeScript 会报错
      const _exhaustiveCheck: never = clientFormat;
      throw new Error(`Unknown client format: ${_exhaustiveCheck}`);
  }
}

/**
 * 将 Provider Type 映射到 Transformer Format
 *
 * Provider Type 和 Transformer Format 是 1:1 映射的，
 * 因为它们都使用标准化的格式命名。
 *
 * @param providerType - 供应商类型
 * @returns 转换器使用的格式
 */
export function mapProviderTypeToTransformer(providerType: ProviderType): Format {
  // Provider Type 和 Transformer Format 完全一致
  // 这个函数主要用于类型安全和显式映射
  return providerType as Format;
}

/**
 * 将 Transformer Format 映射到 Client Format
 *
 * 这个映射用于响应转换时，确定应该返回哪种格式给客户端。
 *
 * @param transformerFormat - 转换器格式
 * @returns 客户端期望的格式
 */
export function mapTransformerFormatToClient(transformerFormat: Format): ClientFormat {
  switch (transformerFormat) {
    case "codex":
      return "response";
    case "openai-compatible":
      return "openai";
    case "claude":
      return "claude";
    case "gemini-cli":
      return "gemini-cli";
    default:
      // 类型守卫：如果有未处理的格式，TypeScript 会报错
      const _exhaustiveCheck: never = transformerFormat;
      throw new Error(`Unknown transformer format: ${_exhaustiveCheck}`);
  }
}

/**
 * 检测请求格式（基于请求体结构）
 *
 * 这个函数用于路由层自动检测请求格式，避免手动指定。
 *
 * 检测优先级：
 * 1. Gemini CLI: 存在 `request` envelope
 * 2. Response API (Codex): 存在 `input` 数组
 * 3. OpenAI Compatible: 存在 `messages` 数组
 * 4. Claude Messages API: 默认（或存在 Claude 特有字段如 `system`）
 *
 * @param requestBody - 请求体（JSON 对象）
 * @returns 检测到的客户端格式
 */
export function detectClientFormat(requestBody: Record<string, unknown>): ClientFormat {
  // 1. 检测 Gemini CLI 格式（envelope 结构）
  if (typeof requestBody.request === "object" && requestBody.request !== null) {
    return "gemini-cli";
  }

  // 2. 检测 Response API (Codex) 格式
  if (Array.isArray(requestBody.input)) {
    return "response";
  }

  // 3. 检测 OpenAI Compatible 格式
  if (Array.isArray(requestBody.messages)) {
    // 进一步区分 OpenAI 和 Claude
    // Claude 的 messages 可能包含 system，但 OpenAI 也可能有 system message
    // 主要区别：Claude 有顶级 system 数组，OpenAI 的 system 是 role: "system" 的消息
    if (Array.isArray(requestBody.system)) {
      // 顶级 system 数组 → Claude Messages API
      return "claude";
    }

    // 默认为 OpenAI Compatible
    return "openai";
  }

  // 4. 默认为 Claude Messages API
  return "claude";
}
