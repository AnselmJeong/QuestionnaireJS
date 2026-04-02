import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { CheckCircle2, FileJson2, Sparkles } from "lucide-react";
import { QuestionnaireFlow } from "@/lib/questionnaire/QuestionnaireFlow";
import { cn } from "@/lib/utils";
const questionnaireModules = import.meta.glob("../questionnaire/*.json", {
    eager: true,
});
const questionnaires = Object.entries(questionnaireModules)
    .map(([path, module]) => {
    const slug = path.split("/").pop()?.replace(".json", "") ?? path;
    return {
        slug,
        schema: module.default,
    };
})
    .sort((left, right) => left.slug.localeCompare(right.slug));
const defaultSlug = questionnaires.find((item) => item.slug === "demographic")?.slug ??
    questionnaires[0]?.slug;
export function App() {
    const [selectedSlug, setSelectedSlug] = useState(defaultSlug);
    const [result, setResult] = useState(null);
    const selectedQuestionnaire = useMemo(() => questionnaires.find((questionnaire) => questionnaire.slug === selectedSlug) ??
        questionnaires[0], [selectedSlug]);
    if (!selectedQuestionnaire) {
        return null;
    }
    return (_jsxs("div", { className: "relative min-h-screen overflow-hidden bg-background text-foreground", children: [_jsx("div", { className: "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(82,181,176,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(226,153,78,0.16),transparent_32%),linear-gradient(180deg,#f7f7f2_0%,#f2efe8_48%,#eef3f2_100%)]" }), _jsx("div", { className: "pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(255,255,255,0.75),transparent)]" }), _jsxs("main", { className: "relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:flex-row lg:px-8", children: [_jsx("aside", { className: "w-full shrink-0 lg:w-[320px]", children: _jsxs("div", { className: "glass-panel flex h-full flex-col gap-5 rounded-[28px] p-5", children: [_jsx("div", { className: "flex items-start justify-between gap-4", children: _jsxs("div", { className: "space-y-2", children: [_jsxs("p", { className: "inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium tracking-[0.22em] text-muted-foreground uppercase", children: [_jsx(Sparkles, { className: "size-3.5" }), "Questionnaire JS"] }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold tracking-[-0.04em] text-balance", children: "SurveyJS\uBCF4\uB2E4 \uAC00\uBCBC\uC6B4 one-question flow" }), _jsx("p", { className: "mt-2 max-w-sm text-sm leading-6 text-muted-foreground", children: "`questionnaire/*.json`\uC744 \uC790\uB3D9\uC73C\uB85C \uC77D\uACE0, \uD55C \uBC88\uC5D0 \uD558\uB098\uC758 \uC9C8\uBB38\uB9CC \uBCF4\uC5EC\uC8FC\uB294 \uACBD\uB7C9 \uBB38\uC9C4 UI\uC785\uB2C8\uB2E4." })] })] }) }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase", children: "Available Forms" }), _jsxs("span", { className: "rounded-full bg-white/70 px-2.5 py-1 text-xs text-muted-foreground", children: [questionnaires.length, " files"] })] }), _jsx("div", { className: "grid gap-2", children: questionnaires.map((item) => {
                                                const isActive = item.slug === selectedQuestionnaire.slug;
                                                const elementCount = item.schema.pages.flatMap((page) => page.elements ?? [])
                                                    .length;
                                                return (_jsxs("button", { type: "button", onClick: () => {
                                                        setSelectedSlug(item.slug);
                                                        setResult(null);
                                                    }, className: cn("flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all", isActive
                                                        ? "border-primary/30 bg-primary/8 shadow-[0_18px_45px_-28px_rgba(20,74,70,0.55)]"
                                                        : "border-white/60 bg-white/65 hover:border-primary/20 hover:bg-white/90"), children: [_jsx("div", { className: cn("mt-0.5 rounded-xl p-2", isActive ? "bg-primary text-primary-foreground" : "bg-secondary"), children: _jsx(FileJson2, { className: "size-4" }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "truncate text-sm font-medium", children: item.slug }), _jsx("p", { className: "mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground", children: item.schema.title ?? item.schema.pages[0]?.title ?? "Untitled form" }), _jsxs("p", { className: "mt-2 text-[11px] tracking-[0.14em] text-muted-foreground uppercase", children: [elementCount, " root elements"] })] })] }, item.slug));
                                            }) })] }), _jsxs("div", { className: "rounded-2xl border border-white/60 bg-white/60 p-4 text-sm leading-6 text-muted-foreground", children: [_jsx("p", { className: "font-medium text-foreground", children: "\uC9C0\uC6D0 \uBC94\uC704" }), _jsx("p", { className: "mt-2", children: "`radiogroup`, `checkbox`, `text`, `boolean`, `matrix`, `panel`, `visibleIf`, `showOtherItem`, `showNoneItem`" })] })] }) }), _jsxs("section", { className: "min-w-0 flex-1", children: [_jsx(QuestionnaireFlow, { questionnaire: selectedQuestionnaire.schema, formId: selectedQuestionnaire.slug, onComplete: setResult }, selectedQuestionnaire.slug), result ? (_jsxs("div", { className: "glass-panel mt-5 rounded-[28px] p-5", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "rounded-2xl bg-primary p-2 text-primary-foreground", children: _jsx(CheckCircle2, { className: "size-4" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium", children: "Submission complete" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "\uACB0\uACFC\uB294 \uC544\uB798\uCC98\uB7FC JSON\uC73C\uB85C \uBC14\uB85C \uD65C\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4." })] })] }), _jsx("pre", { className: "mt-4 overflow-x-auto rounded-2xl bg-[rgba(18,29,29,0.93)] p-4 text-xs leading-6 text-slate-100", children: JSON.stringify(result.answers, null, 2) })] })) : null] })] })] }));
}
