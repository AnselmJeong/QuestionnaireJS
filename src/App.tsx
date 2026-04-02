import { useMemo, useState } from "react";
import { CheckCircle2, FileJson2, Sparkles } from "lucide-react";
import { QuestionnaireFlow } from "@/lib/questionnaire/QuestionnaireFlow";
import type {
  QuestionnaireResult,
  QuestionnaireSchema,
} from "@/lib/questionnaire/types";
import { cn } from "@/lib/utils";

type QuestionnaireModule = {
  default: QuestionnaireSchema;
};

const questionnaireModules = import.meta.glob<QuestionnaireModule>(
  "../questionnaire/*.json",
  {
    eager: true,
  },
);

const questionnaires = Object.entries(questionnaireModules)
  .map(([path, module]) => {
    const slug = path.split("/").pop()?.replace(".json", "") ?? path;
    return {
      slug,
      schema: module.default,
    };
  })
  .sort((left, right) => left.slug.localeCompare(right.slug));

const defaultSlug =
  questionnaires.find((item) => item.slug === "demographic")?.slug ??
  questionnaires[0]?.slug;

export function App() {
  const [selectedSlug, setSelectedSlug] = useState(defaultSlug);
  const [result, setResult] = useState<QuestionnaireResult | null>(null);

  const selectedQuestionnaire = useMemo(
    () =>
      questionnaires.find((questionnaire) => questionnaire.slug === selectedSlug) ??
      questionnaires[0],
    [selectedSlug],
  );

  if (!selectedQuestionnaire) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(82,181,176,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(226,153,78,0.16),transparent_32%),linear-gradient(180deg,#f7f7f2_0%,#f2efe8_48%,#eef3f2_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(255,255,255,0.75),transparent)]" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:flex-row lg:px-8">
        <aside className="w-full shrink-0 lg:w-[320px]">
          <div className="glass-panel flex h-full flex-col gap-5 rounded-[28px] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
                  <Sparkles className="size-3.5" />
                  Questionnaire JS
                </p>
                <div>
                  <h1 className="text-2xl font-semibold tracking-[-0.04em] text-balance">
                    SurveyJS보다 가벼운 one-question flow
                  </h1>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                    `questionnaire/*.json`을 자동으로 읽고, 한 번에 하나의 질문만
                    보여주는 경량 문진 UI입니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                  Available Forms
                </p>
                <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs text-muted-foreground">
                  {questionnaires.length} files
                </span>
              </div>

              <div className="grid gap-2">
                {questionnaires.map((item) => {
                  const isActive = item.slug === selectedQuestionnaire.slug;
                  const elementCount = item.schema.pages.flatMap((page) => page.elements ?? [])
                    .length;

                  return (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => {
                        setSelectedSlug(item.slug);
                        setResult(null);
                      }}
                      className={cn(
                        "flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all",
                        isActive
                          ? "border-primary/30 bg-primary/8 shadow-[0_18px_45px_-28px_rgba(20,74,70,0.55)]"
                          : "border-white/60 bg-white/65 hover:border-primary/20 hover:bg-white/90",
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 rounded-xl p-2",
                          isActive ? "bg-primary text-primary-foreground" : "bg-secondary",
                        )}
                      >
                        <FileJson2 className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.slug}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {item.schema.title ?? item.schema.pages[0]?.title ?? "Untitled form"}
                        </p>
                        <p className="mt-2 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                          {elementCount} root elements
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-white/60 bg-white/60 p-4 text-sm leading-6 text-muted-foreground">
              <p className="font-medium text-foreground">지원 범위</p>
              <p className="mt-2">
                `radiogroup`, `checkbox`, `text`, `boolean`, `matrix`, `panel`,
                `visibleIf`, `showOtherItem`, `showNoneItem`
              </p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <QuestionnaireFlow
            key={selectedQuestionnaire.slug}
            questionnaire={selectedQuestionnaire.schema}
            formId={selectedQuestionnaire.slug}
            onComplete={setResult}
          />

          {result ? (
            <div className="glass-panel mt-5 rounded-[28px] p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary p-2 text-primary-foreground">
                  <CheckCircle2 className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Submission complete</p>
                  <p className="text-sm text-muted-foreground">
                    결과는 아래처럼 JSON으로 바로 활용할 수 있습니다.
                  </p>
                </div>
              </div>
              <pre className="mt-4 overflow-x-auto rounded-2xl bg-[rgba(18,29,29,0.93)] p-4 text-xs leading-6 text-slate-100">
                {JSON.stringify(result.answers, null, 2)}
              </pre>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
