import { CustomDataWorkspace } from "@/components/custom-data/custom-data-workspace";
import { getIndustryTemplates } from "@/lib/custom-data";

export default async function CustomDataPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const resolvedSearchParams = await searchParams;
  const templates = getIndustryTemplates();
  const initialImportOpen = first(resolvedSearchParams.import) === "1";

  return (
    <>
      <div className="mb-5 flex items-end justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b46a]">Extensions</p>
          <h1 className="mt-2 text-3xl font-semibold">通用录入与行业模板</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-[#aaa599]">
            把系统从 VFX 制片追踪扩展成任意行业可用的数据管理平台：自定义字段、表单/表格/快速录入、公式字段、Excel 导入和 AI 识别入口。
          </p>
        </div>
        <div className="hidden border border-[#34322b] bg-[#181713] px-4 py-3 text-right md:block">
          <p className="text-xs text-[#9f9b8f]">Extension slice</p>
          <p className="mt-1 text-sm font-semibold text-[#83d6ae]">Dynamic fields ready</p>
        </div>
      </div>

      <CustomDataWorkspace templates={templates} initialImportOpen={initialImportOpen} />
    </>
  );
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
