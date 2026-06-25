"use client";

import Link from "next/link";
import {
  ArrowRight,
  BellRinging,
  CheckCircle,
  CurrencyCircleDollar,
  Database,
  PlugsConnected,
  Robot,
  Scales,
  ShieldCheck,
  Target,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { DecryptedText } from "@/components/decrypted-text";
import { useTaskWantedLocale } from "@/components/site-header";
import type { MarketplaceSnapshot } from "@/lib/mvp-store";

type HomeExperienceProps = {
  snapshot: MarketplaceSnapshot;
};

const workflow = [
  {
    icon: Target,
    title: "Publish",
    titleZh: "发布",
    body: "Create a funded open contest with blind submissions and single-winner settlement.",
    bodyZh: "创建已托管资金的开放竞赏，盲提交，单一赢家结算。",
  },
  {
    icon: Robot,
    title: "Assist",
    titleZh: "辅助",
    body: "Hunters spend credits on discovery, fit evaluation, and delivery framework preparation.",
    bodyZh: "赏金猎人用 credits 购买发现、适配评估和交付框架准备能力。",
  },
  {
    icon: Scales,
    title: "Settle",
    titleZh: "结算",
    body: "Publisher selects one winner. Admin can inspect disputes, payment rails, and agent logs.",
    bodyZh: "发布者选择一名赢家，管理台可审查争议、支付轨道和 Agent 日志。",
  },
];

export function HomeExperience({ snapshot }: HomeExperienceProps) {
  const locale = useTaskWantedLocale();
  const featured = snapshot.bounties[0];
  const zh = locale === "zh";

  return (
    <main className="overflow-hidden">
      <section className="relative min-h-[calc(100dvh-68px)] border-b border-line">
        <div className="pixel-grid absolute inset-0 opacity-80" aria-hidden="true" />
        <div className="relative mx-auto grid min-h-[calc(100dvh-68px)] max-w-[1440px] grid-rows-[1fr_auto] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 py-12 lg:grid-cols-[1.65fr_0.95fr] lg:items-end lg:py-16">
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-5xl self-end"
            >
              <DecryptedText
                className="mb-6 block font-mono text-xs font-semibold text-muted-strong"
                encryptedClassName="text-accent-soft"
                text={
                  zh
                    ? "AI 原生悬赏市场 / Agent 工作台"
                    : "AI-native bounty market / Agent workbench"
                }
              />
              <h1 className="max-w-[980px] text-[clamp(3.25rem,10vw,8.5rem)] font-semibold leading-[0.86] tracking-normal">
                {zh ? "TaskWanted 让任务悬赏进入 Agent 时代。" : "TaskWanted"}
              </h1>
              {!zh ? (
                <p className="mt-6 max-w-2xl text-xl font-medium leading-tight text-muted-strong sm:text-2xl">
                  Open bounties, blind submissions, hunter-paid AI agents.
                </p>
              ) : null}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className="tw-button accent" href="/bounties">
                  {zh ? "进入悬赏市场" : "Open bounty board"}
                  <ArrowRight size={17} weight="bold" />
                </Link>
                <Link className="tw-button secondary" href="/agent">
                  {zh ? "进入 Agent 工作台" : "Agent workbench"}
                  <Robot size={17} weight="bold" />
                </Link>
              </div>
            </motion.div>

            <motion.aside
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.62, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="tw-panel self-end p-4"
            >
              <div className="border-b border-line pb-4 font-mono text-xs text-muted">
                {zh ? "当前热门悬赏" : "Featured live bounty"}
              </div>
              <div className="py-5">
                <p className="font-mono text-sm text-accent-soft">
                  ${(featured.bountyCents / 100).toLocaleString()}
                </p>
                <h2 className="mt-3 text-2xl font-semibold leading-tight">
                  {zh ? featured.titleZh : featured.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-strong">
                  {zh ? featured.summaryZh : featured.summary}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-line pt-3 font-mono text-xs">
                <Metric label={zh ? "费率" : "Fee"} value={`${featured.feeRateBps / 100}%`} />
                <Metric label={zh ? "提交" : "Submits"} value={String(featured.submissions)} />
                <Metric label={zh ? "模式" : "Mode"} value="Blind" />
              </div>
            </motion.aside>
          </div>

          <div className="pixel-band -mx-4 sm:-mx-6 lg:-mx-8" aria-hidden="true">
            {Array.from({ length: 24 }).map((_, index) => (
              <span className="pixel-tile" key={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
        <div>
          <h2 className="text-4xl font-semibold leading-none sm:text-5xl">
            {zh ? "不是公告板，是结算型产品流程。" : "A complete bounty flow, not a static board."}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-strong">
            {zh
              ? "首页只展示入口。完整发布、提交、Agent、外部机会发现和后台审查会进入对应产品页。"
              : "The home page is the entry. Publishing, submissions, agents, source monitoring, and review live in product pages."}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {workflow.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                className="tw-panel p-5"
                initial={false}
                key={item.title}
                transition={{ delay: index * 0.06, duration: 0.46 }}
                whileHover={{ y: -4 }}
              >
                <Icon size={24} weight="duotone" />
                <h3 className="mt-5 text-lg font-semibold">
                  {zh ? item.titleZh : item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-strong">
                  {zh ? item.bodyZh : item.body}
                </p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section
        id="external"
        className="border-y border-line bg-surface-muted px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-[1440px] gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="tw-panel p-6">
            <PlugsConnected size={26} weight="duotone" />
            <h2 className="mt-5 text-3xl font-semibold">External Bounty Agent Lite</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-strong">
              {zh
                ? "官方连接器优先使用 OAuth/API。登录态页面由用户设备上的本地 watcher 读取，平台只接收标准化机会记录。"
                : "Official connectors use OAuth or APIs first. Logged-in pages are read by a local watcher on the hunter device."}
            </p>
            <div className="mt-6 grid gap-3">
              {snapshot.externalSources.map((source) => (
                <div
                  className="grid gap-3 rounded-[8px] border border-line bg-surface p-4 sm:grid-cols-[1fr_auto]"
                  key={source.id}
                >
                  <div>
                    <p className="font-semibold">{source.name}</p>
                    <p className="mt-1 font-mono text-xs text-muted">
                      {source.mode} / {source.cadence}
                    </p>
                  </div>
                  <span className="self-start rounded-[6px] border border-line px-2 py-1 font-mono text-xs">
                    {source.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <PolicyCard
              icon={<ShieldCheck size={24} weight="duotone" />}
              title={zh ? "不存第三方凭据" : "No third-party credentials"}
              body={
                zh
                  ? "不会存密码、cookie 或完整登录会话。自定义平台只能上传机会元数据。"
                  : "No passwords, cookies, or account sessions are stored. Custom sources upload metadata only."
              }
            />
            <PolicyCard
              icon={<Database size={24} weight="duotone" />}
              title={zh ? "标准化机会记录" : "Normalized records"}
              body={
                zh
                  ? "URL、标题、平台、适配评分、可执行计划，进入同一机会池。"
                  : "URL, title, platform, fit score, and plan status land in one opportunity pool."
              }
            />
            <PolicyCard
              icon={<CurrencyCircleDollar size={24} weight="duotone" />}
              title="0.1% / 1% / 3%"
              body={
                zh
                  ? "发布者按任务风险支付平台费，猎人按 credits 支付 Agent 能力。"
                  : "Publisher fees follow task risk. Hunters pay for agents with credits."
              }
            />
            <PolicyCard
              icon={<BellRinging size={24} weight="duotone" />}
              title={zh ? "后台最小闭环" : "Admin control loop"}
              body={
                zh
                  ? "下架、争议、支付动作、Agent 日志和 kill switch 都在 MVP 范围内。"
                  : "Takedowns, disputes, payment actions, agent logs, and kill switch stay in scope."
              }
            />
          </div>
        </div>
      </section>

      <section
        id="admin"
        className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {snapshot.adminSignals.map((signal) => (
            <article className="border-t border-line py-5" key={signal.label}>
              <p className="font-mono text-xs text-accent-soft">{signal.status}</p>
              <h3 className="mt-3 text-xl font-semibold">{signal.label}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-strong">{signal.detail}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link className="tw-button" href="/bounties">
            {zh ? "发布第一个悬赏" : "Post first bounty"}
            <CheckCircle size={17} weight="bold" />
          </Link>
          <Link className="tw-button secondary" href="/agent">
            {zh ? "配置 Agent" : "Configure agent"}
          </Link>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[6px] bg-surface-muted px-3 py-3">
      <p className="text-muted">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  );
}

function PolicyCard({
  body,
  icon,
  title,
}: {
  body: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <article className="tw-panel p-5">
      {icon}
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted-strong">{body}</p>
    </article>
  );
}
