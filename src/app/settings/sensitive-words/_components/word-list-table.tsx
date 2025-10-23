"use client";

import { useState } from "react";
import type { SensitiveWord } from "@/repository/sensitive-words";
import { updateSensitiveWordAction, deleteSensitiveWordAction } from "@/actions/sensitive-words";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { EditWordDialog } from "./edit-word-dialog";

interface WordListTableProps {
  words: SensitiveWord[];
}

const matchTypeLabels = {
  contains: "包含匹配",
  exact: "精确匹配",
  regex: "正则表达式",
};

const matchTypeColors = {
  contains: "default" as const,
  exact: "secondary" as const,
  regex: "outline" as const,
};

export function WordListTable({ words }: WordListTableProps) {
  const [selectedWord, setSelectedWord] = useState<SensitiveWord | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleToggleEnabled = async (id: number, isEnabled: boolean) => {
    const result = await updateSensitiveWordAction(id, { isEnabled });

    if (result.ok) {
      toast.success(isEnabled ? "敏感词已启用" : "敏感词已禁用");
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id: number, word: string) => {
    if (!confirm(`确定要删除敏感词"${word}"吗？`)) {
      return;
    }

    const result = await deleteSensitiveWordAction(id);

    if (result.ok) {
      toast.success("敏感词删除成功");
    } else {
      toast.error(result.error);
    }
  };

  const handleEdit = (word: SensitiveWord) => {
    setSelectedWord(word);
    setIsEditDialogOpen(true);
  };

  if (words.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        暂无敏感词，点击右上角&ldquo;添加敏感词&rdquo;开始配置。
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">敏感词</th>
              <th className="px-4 py-3 text-left text-sm font-medium">匹配类型</th>
              <th className="px-4 py-3 text-left text-sm font-medium">说明</th>
              <th className="px-4 py-3 text-left text-sm font-medium">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium">创建时间</th>
              <th className="px-4 py-3 text-right text-sm font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {words.map((word) => (
              <tr key={word.id} className="border-b hover:bg-muted/30">
                <td className="px-4 py-3">
                  <code className="rounded bg-muted px-2 py-1 text-sm">{word.word}</code>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={matchTypeColors[word.matchType as keyof typeof matchTypeColors]}>
                    {matchTypeLabels[word.matchType as keyof typeof matchTypeLabels] ||
                      word.matchType}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {word.description || "-"}
                </td>
                <td className="px-4 py-3">
                  <Switch
                    checked={word.isEnabled}
                    onCheckedChange={(checked) => handleToggleEnabled(word.id, checked)}
                  />
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {new Date(word.createdAt).toLocaleString("zh-CN")}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(word)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(word.id, word.word)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedWord && (
        <EditWordDialog
          word={selectedWord}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </>
  );
}
