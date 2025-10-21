"use server";

import { db } from "@/drizzle/db";
import { providers } from "@/drizzle/schema";
import { eq, isNull, and, desc } from "drizzle-orm";
import type { Provider, CreateProviderData, UpdateProviderData } from "@/types/provider";
import { toProvider } from "./_shared/transformers";

export async function createProvider(providerData: CreateProviderData): Promise<Provider> {
  const dbData = {
    name: providerData.name,
    url: providerData.url,
    key: providerData.key,
    isEnabled: providerData.is_enabled,
    weight: providerData.weight,
    priority: providerData.priority,
    costPerMtok: providerData.cost_per_mtok != null ? providerData.cost_per_mtok.toString() : null,
    groupTag: providerData.group_tag,
    limit5hUsd: providerData.limit_5h_usd != null ? providerData.limit_5h_usd.toString() : null,
    limitWeeklyUsd: providerData.limit_weekly_usd != null ? providerData.limit_weekly_usd.toString() : null,
    limitMonthlyUsd: providerData.limit_monthly_usd != null ? providerData.limit_monthly_usd.toString() : null,
    limitConcurrentSessions: providerData.limit_concurrent_sessions,
    tpm: providerData.tpm,
    rpm: providerData.rpm,
    rpd: providerData.rpd,
    cc: providerData.cc,
  };

  const [provider] = await db.insert(providers).values(dbData).returning({
    id: providers.id,
    name: providers.name,
    url: providers.url,
    key: providers.key,
    isEnabled: providers.isEnabled,
    weight: providers.weight,
    priority: providers.priority,
    costPerMtok: providers.costPerMtok,
    groupTag: providers.groupTag,
    limit5hUsd: providers.limit5hUsd,
    limitWeeklyUsd: providers.limitWeeklyUsd,
    limitMonthlyUsd: providers.limitMonthlyUsd,
    limitConcurrentSessions: providers.limitConcurrentSessions,
    tpm: providers.tpm,
    rpm: providers.rpm,
    rpd: providers.rpd,
    cc: providers.cc,
    createdAt: providers.createdAt,
    updatedAt: providers.updatedAt,
    deletedAt: providers.deletedAt,
  });

  return toProvider(provider);
}

export async function findProviderList(limit: number = 50, offset: number = 0): Promise<Provider[]> {
  const result = await db
    .select({
      id: providers.id,
      name: providers.name,
      url: providers.url,
      key: providers.key,
      isEnabled: providers.isEnabled,
      weight: providers.weight,
      priority: providers.priority,
      costPerMtok: providers.costPerMtok,
      groupTag: providers.groupTag,
      limit5hUsd: providers.limit5hUsd,
      limitWeeklyUsd: providers.limitWeeklyUsd,
      limitMonthlyUsd: providers.limitMonthlyUsd,
      limitConcurrentSessions: providers.limitConcurrentSessions,
      tpm: providers.tpm,
      rpm: providers.rpm,
      rpd: providers.rpd,
      cc: providers.cc,
      createdAt: providers.createdAt,
      updatedAt: providers.updatedAt,
      deletedAt: providers.deletedAt,
    })
    .from(providers)
    .where(isNull(providers.deletedAt))
    .orderBy(desc(providers.createdAt))
    .limit(limit)
    .offset(offset);

  return result.map(toProvider);
}

export async function findProviderById(id: number): Promise<Provider | null> {
  const [provider] = await db
    .select({
      id: providers.id,
      name: providers.name,
      url: providers.url,
      key: providers.key,
      isEnabled: providers.isEnabled,
      weight: providers.weight,
      priority: providers.priority,
      costPerMtok: providers.costPerMtok,
      groupTag: providers.groupTag,
      limit5hUsd: providers.limit5hUsd,
      limitWeeklyUsd: providers.limitWeeklyUsd,
      limitMonthlyUsd: providers.limitMonthlyUsd,
      limitConcurrentSessions: providers.limitConcurrentSessions,
      tpm: providers.tpm,
      rpm: providers.rpm,
      rpd: providers.rpd,
      cc: providers.cc,
      createdAt: providers.createdAt,
      updatedAt: providers.updatedAt,
      deletedAt: providers.deletedAt,
    })
    .from(providers)
    .where(and(eq(providers.id, id), isNull(providers.deletedAt)));

  if (!provider) return null;
  return toProvider(provider);
}

export async function updateProvider(id: number, providerData: UpdateProviderData): Promise<Provider | null> {
  if (Object.keys(providerData).length === 0) {
    return findProviderById(id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbData: any = {
    updatedAt: new Date(),
  };
  if (providerData.name !== undefined) dbData.name = providerData.name;
  if (providerData.url !== undefined) dbData.url = providerData.url;
  if (providerData.key !== undefined) dbData.key = providerData.key;
  if (providerData.is_enabled !== undefined) dbData.isEnabled = providerData.is_enabled;
  if (providerData.weight !== undefined) dbData.weight = providerData.weight;
  if (providerData.priority !== undefined) dbData.priority = providerData.priority;
  if (providerData.cost_per_mtok !== undefined) dbData.costPerMtok = providerData.cost_per_mtok != null ? providerData.cost_per_mtok.toString() : null;
  if (providerData.group_tag !== undefined) dbData.groupTag = providerData.group_tag;
  if (providerData.limit_5h_usd !== undefined) dbData.limit5hUsd = providerData.limit_5h_usd != null ? providerData.limit_5h_usd.toString() : null;
  if (providerData.limit_weekly_usd !== undefined) dbData.limitWeeklyUsd = providerData.limit_weekly_usd != null ? providerData.limit_weekly_usd.toString() : null;
  if (providerData.limit_monthly_usd !== undefined) dbData.limitMonthlyUsd = providerData.limit_monthly_usd != null ? providerData.limit_monthly_usd.toString() : null;
  if (providerData.limit_concurrent_sessions !== undefined) dbData.limitConcurrentSessions = providerData.limit_concurrent_sessions;
  if (providerData.tpm !== undefined) dbData.tpm = providerData.tpm;
  if (providerData.rpm !== undefined) dbData.rpm = providerData.rpm;
  if (providerData.rpd !== undefined) dbData.rpd = providerData.rpd;
  if (providerData.cc !== undefined) dbData.cc = providerData.cc;

  const [provider] = await db
    .update(providers)
    .set(dbData)
    .where(and(eq(providers.id, id), isNull(providers.deletedAt)))
    .returning({
      id: providers.id,
      name: providers.name,
      url: providers.url,
      key: providers.key,
      isEnabled: providers.isEnabled,
      weight: providers.weight,
      priority: providers.priority,
      costPerMtok: providers.costPerMtok,
      groupTag: providers.groupTag,
      limit5hUsd: providers.limit5hUsd,
      limitWeeklyUsd: providers.limitWeeklyUsd,
      limitMonthlyUsd: providers.limitMonthlyUsd,
      limitConcurrentSessions: providers.limitConcurrentSessions,
      tpm: providers.tpm,
      rpm: providers.rpm,
      rpd: providers.rpd,
      cc: providers.cc,
      createdAt: providers.createdAt,
      updatedAt: providers.updatedAt,
      deletedAt: providers.deletedAt,
    });

  if (!provider) return null;
  return toProvider(provider);
}

export async function deleteProvider(id: number): Promise<boolean> {
  const result = await db
    .update(providers)
    .set({ deletedAt: new Date() })
    .where(and(eq(providers.id, id), isNull(providers.deletedAt)))
    .returning({ id: providers.id });

  return result.length > 0;
}
