import { PageHeader, Metric } from "@/components/extensions/entity-type-pages";
import type { AiScanItem } from "@/lib/ai-recognition";

export function AiRecognizePageView({ scans }: { scans: AiScanItem[] }) {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="AI recognition" title="AI 单据识别工作台" description="发票、手写表格、采购单、名片和合同可以进入同一个识别接口。未配置 API Key 时会返回可测试的模拟结果，方便先打通流程。" />
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Modes" value={5} />
        <Metric label="Scans" value={scans.length} />
        <Metric label="Provider" value={scans[0]?.provider ?? "mock"} />
        <Metric label="Avg Conf." value={`${Math.round((scans.reduce((sum, scan) => sum + scan.confidence, 0) / Math.max(1, scans.length)) * 100)}%`} />
      </div>
      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="border border-dashed border-[#4a463d] bg-[#181713] p-8">
          <p className="text-lg font-semibold">拖拽图片 / PDF / 手写单据到这里</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#aaa599]">前端上传组件预留给真实文件流；API 已支持 invoice、table、document、card、custom 五种模式，并会把扫描历史写入识别记录。</p>
          <div className="mt-6 grid gap-2 md:grid-cols-5">
            {["invoice", "table", "document", "card", "custom"].map((mode) => <span key={mode} className="border border-[#34322b] bg-[#11110f] px-3 py-2 text-center font-mono text-xs text-[#e8c678]">{mode}</span>)}
          </div>
        </div>
        <aside className="border border-[#34322b] bg-[#181713] p-4">
          <p className="text-sm font-semibold">调用示例</p>
          <pre className="mt-3 overflow-auto bg-[#11110f] p-3 text-xs leading-5 text-[#8f8a7e]">{`POST /api/ai/recognize
{
  "mode": "invoice",
  "entityTypeId": "retail-purchase-order"
}`}</pre>
        </aside>
      </section>
      <AiScansTable scans={scans} />
    </div>
  );
}

export function AiScansTable({ scans }: { scans: AiScanItem[] }) {
  return (
    <section className="border border-[#34322b] bg-[#181713]">
      <div className="grid grid-cols-[140px_140px_120px_1fr_180px] border-b border-[#2a2a28] bg-[#1e1e1c] px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-[#6e6e69]">
        <span>Mode</span>
        <span>Provider</span>
        <span>Confidence</span>
        <span>Result</span>
        <span>Created</span>
      </div>
      {scans.map((scan) => (
        <div key={scan.id} className="grid grid-cols-[140px_140px_120px_1fr_180px] border-b border-[#2a2a28] px-4 py-3 text-sm last:border-b-0">
          <span className="font-mono text-[#e8c678]">{scan.mode}</span>
          <span className="text-[#c9c3b5]">{scan.provider}</span>
          <span className="font-mono text-[#83d6ae]">{Math.round(scan.confidence * 100)}%</span>
          <span className="truncate font-mono text-xs text-[#8f8a7e]">{JSON.stringify(scan.rawResult)}</span>
          <span className="text-[#8f8a7e]">{scan.createdAt.slice(0, 10)}</span>
        </div>
      ))}
    </section>
  );
}
