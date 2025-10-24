import type { Provider } from "@/types/provider";
import { logger } from "@/lib/logger";
import type { ProxySession } from "./session";

/**
 * 模型重定向器
 *
 * 根据供应商配置的 modelRedirects 重写请求中的模型名称
 * 例如：将 "gpt-5" 重定向为 "gpt-5-codex"
 */
export class ModelRedirector {
  /**
   * 应用模型重定向（如果配置了）
   *
   * @param session - 代理会话
   * @param provider - 目标供应商
   * @returns 是否进行了重定向
   */
  static apply(session: ProxySession, provider: Provider): boolean {
    // 检查是否配置了模型重定向
    if (!provider.modelRedirects || Object.keys(provider.modelRedirects).length === 0) {
      return false;
    }

    // 获取原始模型名称
    const originalModel = session.request.model;
    if (!originalModel) {
      logger.debug("[ModelRedirector] No model found in request, skipping redirect");
      return false;
    }

    // 检查是否有该模型的重定向配置
    const redirectedModel = provider.modelRedirects[originalModel];
    if (!redirectedModel) {
      logger.debug(
        `[ModelRedirector] No redirect configured for model "${originalModel}" in provider ${provider.id}`
      );
      return false;
    }

    // 执行重定向
    logger.info(
      `[ModelRedirector] Redirecting model: "${originalModel}" → "${redirectedModel}" (provider ${provider.id})`
    );

    // 保存原始模型（用于计费，必须在修改 request.model 之前）
    session.setOriginalModel(originalModel);

    // 修改 message 对象中的模型
    session.request.message.model = redirectedModel;

    // 更新缓存的 model 字段
    session.request.model = redirectedModel;

    // 重新生成请求 buffer（使用 TextEncoder）
    const updatedBody = JSON.stringify(session.request.message);
    const encoder = new TextEncoder();
    session.request.buffer = encoder.encode(updatedBody).buffer;

    // 更新日志（记录重定向）
    session.request.note = `[Model Redirected: ${originalModel} → ${redirectedModel}] ${session.request.note || ""}`;

    return true;
  }

  /**
   * 获取重定向后的模型名称（不修改 session）
   *
   * @param originalModel - 原始模型名称
   * @param provider - 供应商
   * @returns 重定向后的模型名称（如果没有重定向则返回原始名称）
   */
  static getRedirectedModel(originalModel: string, provider: Provider): string {
    if (!provider.modelRedirects || !originalModel) {
      return originalModel;
    }

    return provider.modelRedirects[originalModel] || originalModel;
  }

  /**
   * 检查供应商是否配置了指定模型的重定向
   *
   * @param model - 模型名称
   * @param provider - 供应商
   * @returns 是否配置了重定向
   */
  static hasRedirect(model: string, provider: Provider): boolean {
    return !!(provider.modelRedirects && model && provider.modelRedirects[model]);
  }
}
