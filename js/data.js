/**
 * ContextForge Course Data
 * Production-grade content for IDE Player, Curriculum Bento, and Starter Kit
 */

const COURSE_DATA = {
  ideSteps: [
    {
      id: "step-1",
      number: "01",
      title: "Промпт спецификации (PRD)",
      subtitle: "Постановка задачи через структуру, а не через чат",
      terminalCmd: "npx contextforge spec:generate --feature auth-billing",
      fileTab: "specs/prd-billing.md",
      code: `# Feature Spec: Multi-tenant Team Billing & Supabase RLS
Goal: Автоматический биллинг подписок с изоляцией данных организаций

## Constraints
1. Next.js 15 (App Router, Server Actions, TypeScript strict)
2. Supabase Auth + Database (Row-Level Security обязателен)
3. Stripe Webhooks с идемпотентностью через таблицу webhook_events
4. Zero-trust: клиентский контекст никогда не передает org_id напрямую`,
      status: "Спецификация сгенерирована и зафиксирована в Git",
      badge: "Spec-Driven",
      highlightLine: 5
    },
    {
      id: "step-2",
      number: "02",
      title: "Guardrails & .cursorrules",
      subtitle: "Жесткие рамки контекста для LLM агента",
      terminalCmd: "cursor-agent apply-rules --strict",
      fileTab: ".cursorrules",
      code: `// Rule 1: Always enforce Supabase RLS policies
EVERY create table query MUST have:
- alter table ... enable row level security;
- create policy "Tenant isolation" on ... using (org_id = auth.current_org_id());

// Rule 2: App Router constraints
- DO NOT use client-side supabase calls for mutations.
- Use only validated Server Actions via Zod schema.`,
      status: "Правила контекста загружены в память агента (0 галлюцинаций)",
      badge: "Rules Locked",
      highlightLine: 2
    },
    {
      id: "step-3",
      number: "03",
      title: "Supabase Schema & RLS",
      subtitle: "Генерация безопасной схемы базы данных",
      terminalCmd: "supabase db diff -f create_subscriptions_and_rls",
      fileTab: "supabase/migrations/20261018_billing.sql",
      code: `CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'canceled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own org subscription"
  ON public.subscriptions FOR SELECT
  USING (org_id IN (SELECT org_id FROM public.memberships WHERE user_id = auth.uid()));`,
      status: "Миграция создана, проверена на безопасность и применена локально",
      badge: "Database Safe",
      highlightLine: 9
    },
    {
      id: "step-4",
      number: "04",
      title: "Next.js Server Action",
      subtitle: "Чистый продакшн-код без спагетти",
      terminalCmd: "cursor-agent implement --action createCheckoutSession",
      fileTab: "app/actions/billing.ts",
      code: `"use server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

const CheckoutSchema = z.object({ planId: z.enum(["starter", "pro"]) });

export async function createCheckout(formData: FormData) {
  const { planId } = CheckoutSchema.parse(Object.fromEntries(formData));
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");

  // Идемпотентный вызов Stripe Checkout
  return await stripe.checkout.sessions.create({ /* payload */ });
}`,
      status: "Типизированный Server Action с валидацией Zod сгенерирован",
      badge: "Type-Safe",
      highlightLine: 9
    },
    {
      id: "step-5",
      number: "05",
      title: "Автономные тесты & CI",
      subtitle: "Агент сам находит баг, фиксит и подтверждает билд",
      terminalCmd: "pnpm test:e2e && pnpm typecheck",
      fileTab: "terminal.output",
      code: `✓ specs/billing.test.ts (4 tests passed)
  ✓ should prevent cross-tenant subscription leakage (RLS verification)
  ✓ should reject unauthenticated checkout calls (Zod validation)
  ✓ should process stripe webhook with idempotency key
  ✓ latency benchmark: server action cold start < 140ms

Typecheck: 0 errors across 48 files.
Result: Production build succeeded in 18.4s.`,
      status: "Все 4 теста пройдены. Код готов к деплою на Vercel",
      badge: "Tests Green",
      highlightLine: 1
    }
  ],

  cursorrulesSample: `# ContextForge Production .cursorrules for Next.js 15 & Supabase
# Версия 2.4.0 • Протестировано на Claude 3.5 Sonnet & GPT-4o

[SYSTEM_CORE]
You are an Elite Principal AI Software Architect.
Your code is production-ready, strictly typed, minimal, and secure.
You NEVER write placeholder comments, '// TODO', or omit implementations.

[ARCHITECTURE_CONSTRAINTS]
- Framework: Next.js 15 App Router (React 19)
- Language: TypeScript with strict null checks
- Styling: Modern CSS / Tailwind CSS (no inline style hacks)
- Data Layer: Supabase PostgreSQL with mandatory Row Level Security (RLS)
- Validation: Zod schemas on every client-to-server boundary

[CONTEXT_WINDOW_HYGIENE]
- Before editing any file > 200 lines, use the terminal subagent.
- Read exact symbol references before modifying imports.
- Never rewrite unchanged utility functions; produce precise surgical diffs.

[SUPABASE_SECURITY_GUARDRAILS]
- NEVER execute raw SQL without parameterized inputs.
- Every table MUST have an RLS policy. A table without RLS is a fatal violation.
- Client components may NEVER import service_role keys. Only anon key with RLS.`,

  bentoModules: [
    {
      id: "mod-1",
      tag: "Модуль 01",
      title: "Context Architecture & Spec-Driven Dev",
      desc: "Как перестать писать код руками и начать мыслить спецификациями. Декомпозиция эпиков в PRD, системные промпты и управление памятью контекстного окна LLM.",
      badge: "Фундамент",
      bullets: ["Архитектура PRD для AI-агентов", "Управление окном контекста (Lost in the Middle)", "Шаблоны спецификаций Next.js + DB"]
    },
    {
      id: "mod-2",
      tag: "Модуль 02",
      title: "Hard Guardrails: Магия .cursorrules",
      desc: "Создание непробиваемых правил для редактора Cursor и Windsurf. Как заставить нейросеть писать код в вашем стиле, уважать типы и никогда не трогать легаси-файлы без спроса.",
      badge: "Контроль",
      bullets: ["Кастомные .cursorrules под React, Python, Go", "Запреты на галлюцинации и спагетти", "Хирургические дифф-правки больших файлов"]
    },
    {
      id: "mod-3",
      tag: "Модуль 03",
      title: "Supabase, Auth & Database Integrity",
      desc: "Базы данных с AI без страха снести прод. Генерация миграций, автоматические RLS-политики безопасности, триггеры и безопасные Server Actions.",
      badge: "Безопасность",
      bullets: ["Zero-Trust изоляция арендаторов через RLS", "Авто-миграции и сидирование данных", "Безопасная интеграция Stripe & Webhooks"]
    },
    {
      id: "mod-4",
      tag: "Модуль 04",
      title: "Терминальные агенты & Автономный дебаг",
      desc: "Использование CLI-агентов для сложных рефакторингов, поиска регрессий по логам ошибок и самовосстанавливающихся E2E тестов.",
      badge: "Автономия",
      bullets: ["Claude Code, Aider и Roo CLI", "Поиск багов по логам браузера и терминала", "Сборка и деплой боевого SaaS за 7 дней"]
    }
  ],

  pricing: [
    {
      id: "engineer",
      name: "Инженер",
      badge: "Для разработчиков",
      price: "24 900 ₽",
      installment: "от 2 075 ₽ / мес в рассрочку",
      desc: "Для тех, кто хочет ускорить разработку в 5 раз, победить спагетти-код и научиться дирижировать агентами.",
      features: [
        "Доступ ко всем 4 модулям (40+ уроков)",
        "Готовый Starter Kit с шаблонами .cursorrules под 6 стеков",
        "Инженерные шаблоны PRD и архитектурных спецификаций",
        "Бессрочный доступ к закрытой базе знаний и обновлениям",
        "7 дней безусловная гарантия возврата"
      ],
      cta: "Выбрать тариф «Инженер»",
      popular: false
    },
    {
      id: "architect",
      name: "Архитектор",
      badge: "Выбор большинства",
      price: "39 900 ₽",
      installment: "от 3 325 ₽ / мес в рассрочку",
      desc: "Полное погружение с код-ревью реального проекта, разбором архитектуры и членством в клубе практиков.",
      features: [
        "Всё, что входит в тариф «Инженер»",
        "Личное код-ревью вашего pet-проекта или SaaS от автора",
        "Закрытый Discord/Telegram клуб AI-архитекторов",
        "Еженедельные живые сессии разбора багов и новых релизов моделей",
        "Сертификат об окончании с верификацией в GitHub",
        "7 дней безусловная гарантия возврата"
      ],
      cta: "Выбрать тариф «Архитектор»",
      popular: true
    }
  ]
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = COURSE_DATA;
}
