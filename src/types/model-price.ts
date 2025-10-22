/**
 * 模型价格数据
 */
export interface ModelPriceData {
  // 基础价格信息
  input_cost_per_token?: number;
  output_cost_per_token?: number;

  // 缓存相关价格
  cache_creation_input_token_cost?: number;
  cache_creation_input_token_cost_above_1hr?: number;
  cache_read_input_token_cost?: number;

  // 图片生成价格
  output_cost_per_image?: number;

  // 搜索上下文价格
  search_context_cost_per_query?: {
    search_context_size_high?: number;
    search_context_size_low?: number;
    search_context_size_medium?: number;
  };

  // 模型能力信息
  litellm_provider?: string;
  max_input_tokens?: number;
  max_output_tokens?: number;
  max_tokens?: number;
  mode?: "chat" | "image_generation" | "completion";

  // 支持的功能
  supports_assistant_prefill?: boolean;
  supports_computer_use?: boolean;
  supports_function_calling?: boolean;
  supports_pdf_input?: boolean;
  supports_prompt_caching?: boolean;
  supports_reasoning?: boolean;
  supports_response_schema?: boolean;
  supports_tool_choice?: boolean;
  supports_vision?: boolean;

  // 其他字段
  tool_use_system_prompt_tokens?: number;
  [key: string]: unknown; // 允许额外字段
}

/**
 * 模型价格记录
 */
export interface ModelPrice {
  id: number;
  modelName: string;
  priceData: ModelPriceData;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 价格表JSON格式
 */
export interface PriceTableJson {
  [modelName: string]: ModelPriceData;
}

/**
 * 批量更新结果
 */
export interface PriceUpdateResult {
  added: string[]; // 新增的模型
  updated: string[]; // 更新的模型
  unchanged: string[]; // 未变化的模型
  failed: string[]; // 处理失败的模型
  total: number; // 总数
}
