"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getModelList, getStatusCodeList } from "@/actions/usage-logs";
import { getKeys } from "@/actions/keys";
import type { UserDisplay } from "@/types/user";
import type { ProviderDisplay } from "@/types/provider";
import type { Key } from "@/types/key";

/**
 * 将 Date 对象格式化为 datetime-local 输入所需的格式
 * 保持本地时区，不转换为 UTC
 */
function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * 解析 datetime-local 输入的值为 Date 对象
 * 保持本地时区语义
 */
function parseDateTimeLocal(value: string): Date {
  // datetime-local 返回格式: "2025-10-23T10:30"
  // 直接用 new Date() 会按照本地时区解析
  return new Date(value);
}

interface UsageLogsFiltersProps {
  isAdmin: boolean;
  users: UserDisplay[];
  providers: ProviderDisplay[];
  filters: {
    userId?: number;
    keyId?: number;
    providerId?: number;
    startDate?: Date;
    endDate?: Date;
    statusCode?: number;
    model?: string;
  };
  onChange: (filters: UsageLogsFiltersProps["filters"]) => void;
  onReset: () => void;
}

export function UsageLogsFilters({
  isAdmin,
  users,
  providers,
  filters,
  onChange,
  onReset,
}: UsageLogsFiltersProps) {
  const [models, setModels] = useState<string[]>([]);
  const [statusCodes, setStatusCodes] = useState<number[]>([]);
  const [keys, setKeys] = useState<Key[]>([]);
  const [localFilters, setLocalFilters] = useState(filters);

  // 加载筛选器选项
  useEffect(() => {
    const loadOptions = async () => {
      const [modelsResult, codesResult] = await Promise.all([
        getModelList(),
        getStatusCodeList(),
      ]);

      if (modelsResult.ok && modelsResult.data) {
        setModels(modelsResult.data);
      }

      if (codesResult.ok && codesResult.data) {
        setStatusCodes(codesResult.data);
      }

      // 如果选择了用户，加载该用户的 keys
      if (localFilters.userId) {
        const keysResult = await getKeys(localFilters.userId);
        if (keysResult.ok && keysResult.data) {
          setKeys(keysResult.data);
        }
      }
    };

    loadOptions();
  }, [localFilters.userId]);

  // 处理用户选择变更
  const handleUserChange = async (userId: string) => {
    const newUserId = userId ? parseInt(userId) : undefined;
    const newFilters = { ...localFilters, userId: newUserId, keyId: undefined };
    setLocalFilters(newFilters);

    // 加载该用户的 keys
    if (newUserId) {
      const keysResult = await getKeys(newUserId);
      if (keysResult.ok && keysResult.data) {
        setKeys(keysResult.data);
      }
    } else {
      setKeys([]);
    }
  };

  const handleApply = () => {
    onChange(localFilters);
  };

  const handleReset = () => {
    setLocalFilters({});
    setKeys([]);
    onReset();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 时间范围 */}
        <div className="space-y-2">
          <Label>开始时间</Label>
          <Input
            type="datetime-local"
            value={localFilters.startDate ? formatDateTimeLocal(localFilters.startDate) : ""}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                startDate: e.target.value ? parseDateTimeLocal(e.target.value) : undefined,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>结束时间</Label>
          <Input
            type="datetime-local"
            value={localFilters.endDate ? formatDateTimeLocal(localFilters.endDate) : ""}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                endDate: e.target.value ? parseDateTimeLocal(e.target.value) : undefined,
              })
            }
          />
        </div>

        {/* 用户选择（仅 Admin） */}
        {isAdmin && (
          <div className="space-y-2">
            <Label>用户</Label>
            <Select
              value={localFilters.userId?.toString() || ""}
              onValueChange={handleUserChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="全部用户" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Key 选择 */}
        <div className="space-y-2">
          <Label>API 密钥</Label>
          <Select
            value={localFilters.keyId?.toString() || ""}
            onValueChange={(value: string) =>
              setLocalFilters({
                ...localFilters,
                keyId: value ? parseInt(value) : undefined,
              })
            }
            disabled={isAdmin && !localFilters.userId}
          >
            <SelectTrigger>
              <SelectValue placeholder={isAdmin && !localFilters.userId ? "请先选择用户" : "全部密钥"} />
            </SelectTrigger>
            <SelectContent>
              {keys.map((key) => (
                <SelectItem key={key.id} value={key.id.toString()}>
                  {key.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 供应商选择 */}
        {isAdmin && (
          <div className="space-y-2">
            <Label>供应商</Label>
            <Select
              value={localFilters.providerId?.toString() || ""}
              onValueChange={(value: string) =>
                setLocalFilters({
                  ...localFilters,
                  providerId: value ? parseInt(value) : undefined,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="全部供应商" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id.toString()}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 模型选择 */}
        <div className="space-y-2">
          <Label>模型</Label>
          <Select
            value={localFilters.model || ""}
            onValueChange={(value: string) =>
              setLocalFilters({ ...localFilters, model: value || undefined })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="全部模型" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 状态码选择 */}
        <div className="space-y-2">
          <Label>状态码</Label>
          <Select
            value={localFilters.statusCode?.toString() || ""}
            onValueChange={(value: string) =>
              setLocalFilters({
                ...localFilters,
                statusCode: value ? parseInt(value) : undefined,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="全部状态码" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="200">200 (成功)</SelectItem>
              <SelectItem value="400">400 (错误请求)</SelectItem>
              <SelectItem value="401">401 (未授权)</SelectItem>
              <SelectItem value="429">429 (限流)</SelectItem>
              <SelectItem value="500">500 (服务器错误)</SelectItem>
              {statusCodes
                .filter((code) => ![200, 400, 401, 429, 500].includes(code))
                .map((code) => (
                  <SelectItem key={code} value={code.toString()}>
                    {code}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <Button onClick={handleApply}>应用筛选</Button>
        <Button variant="outline" onClick={handleReset}>
          重置
        </Button>
      </div>
    </div>
  );
}
