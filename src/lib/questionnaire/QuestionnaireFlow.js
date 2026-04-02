import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useEffectEvent, useMemo, useRef, useState, } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, CircleDot, Eraser, ListChecks, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NONE_VALUE, normalizeQuestionnaire, OTHER_VALUE, } from "@/lib/questionnaire/normalize";
import { evaluateVisibleIf } from "@/lib/questionnaire/visibility";
import { cn } from "@/lib/utils";
function getTitleSizing(title) {
    const length = title.replace(/\s+/g, "").length;
    if (length >= 90) {
        return {
            container: "max-w-6xl",
            titleClass: "text-[clamp(1.3rem,0.96rem+1.2vw,2.05rem)] leading-[1.42] tracking-[-0.04em]",
            asideClass: "mt-3 text-[clamp(1.02rem,0.9rem+0.45vw,1.25rem)] leading-[1.75] tracking-[-0.025em]",
        };
    }
    if (length >= 60) {
        return {
            container: "max-w-5xl",
            titleClass: "text-[clamp(1.42rem,1.02rem+1.45vw,2.45rem)] leading-[1.34] tracking-[-0.045em]",
            asideClass: "mt-3 text-[clamp(1.05rem,0.94rem+0.38vw,1.28rem)] leading-[1.72] tracking-[-0.025em]",
        };
    }
    return {
        container: "max-w-5xl",
        titleClass: "text-[clamp(1.55rem,1.1rem+1.85vw,3rem)] leading-[1.24] tracking-[-0.05em]",
        asideClass: "mt-3 text-[clamp(1.05rem,0.94rem+0.38vw,1.28rem)] leading-[1.72] tracking-[-0.025em]",
    };
}
function splitParenthetical(title) {
    const match = title.match(/^(.*?)(\s*[\(\[].*[\)\]])$/);
    if (!match) {
        return {
            main: title,
            aside: null,
        };
    }
    const [, main, aside] = match;
    if (aside.length < 12) {
        return {
            main: title,
            aside: null,
        };
    }
    return {
        main: main.trim(),
        aside: aside.trim(),
    };
}
function buildInitialAnswers(steps) {
    return steps.reduce((accumulator, step) => {
        if (step.defaultValue === undefined) {
            return accumulator;
        }
        if (step.kind === "matrix-row") {
            const currentGroup = accumulator[step.matrixName] ?? {};
            accumulator[step.matrixName] = {
                ...currentGroup,
                [step.rowName]: step.defaultValue,
            };
            return accumulator;
        }
        accumulator[step.name] = step.defaultValue;
        return accumulator;
    }, {});
}
function getStepValue(step, answers) {
    if (step.kind === "matrix-row") {
        return answers[step.matrixName]?.[step.rowName];
    }
    return answers[step.name];
}
function setStepValue(step, answers, value) {
    if (step.kind === "matrix-row") {
        const existingGroup = answers[step.matrixName] ?? {};
        return {
            ...answers,
            [step.matrixName]: {
                ...existingGroup,
                [step.rowName]: value,
            },
        };
    }
    return {
        ...answers,
        [step.name]: value,
    };
}
function clearStepValue(step, answers) {
    if (step.kind === "matrix-row") {
        const existingGroup = answers[step.matrixName] ?? {};
        const nextGroup = { ...existingGroup };
        delete nextGroup[step.rowName];
        return {
            ...answers,
            [step.matrixName]: nextGroup,
        };
    }
    const nextAnswers = { ...answers };
    delete nextAnswers[step.name];
    delete nextAnswers[`${step.name}__other`];
    return nextAnswers;
}
function isChoiceSelected(currentValue, candidate) {
    if (Array.isArray(currentValue)) {
        return currentValue.includes(candidate);
    }
    return currentValue === candidate;
}
function isAnswered(step, answers) {
    const value = getStepValue(step, answers);
    if (step.kind === "checkbox") {
        return Array.isArray(value) && value.length > 0;
    }
    if (step.kind === "text") {
        return typeof value === "string" || typeof value === "number";
    }
    return value !== undefined && value !== null && value !== "";
}
function isValid(step, answers) {
    if (!step.isRequired) {
        return true;
    }
    const value = getStepValue(step, answers);
    if (step.kind === "checkbox") {
        return Array.isArray(value) && value.length > 0;
    }
    if (step.kind === "text") {
        if (step.inputType === "number") {
            const numericValue = Number(value);
            if (Number.isNaN(numericValue)) {
                return false;
            }
            if (step.min !== undefined && numericValue < step.min) {
                return false;
            }
            if (step.max !== undefined && numericValue > step.max) {
                return false;
            }
            return true;
        }
        return typeof value === "string" && value.trim().length > 0;
    }
    return value !== undefined && value !== null && value !== "";
}
function OptionGrid({ cols = 1, children, }) {
    return (_jsx("div", { className: cn("mx-auto grid w-full gap-3", cols === 1 ? "max-w-[80%]" : "max-w-[92%]", cols >= 2 ? "md:grid-cols-2" : "grid-cols-1", cols >= 3 ? "xl:grid-cols-3" : ""), children: children }));
}
function renderRadioStep(step, answers, setAnswers) {
    const currentValue = getStepValue(step, answers);
    const otherTextKey = step.kind === "radiogroup" ? `${step.name}__other` : undefined;
    const choiceColumns = step.kind === "radiogroup" ? step.colCount ?? 1 : 1;
    const choices = step.kind === "matrix-row" ? step.columns : step.choices;
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsx(RadioGroup, { value: currentValue === undefined ? "" : String(currentValue), onValueChange: (nextValue) => {
                    const resolved = choices.find((choice) => String(choice.value) === nextValue)?.value;
                    setAnswers((prev) => setStepValue(step, prev, resolved));
                }, className: "gap-3", children: _jsx(OptionGrid, { cols: choiceColumns, children: choices.map((choice) => {
                        const selected = isChoiceSelected(currentValue, choice.value);
                        return (_jsxs("label", { className: cn("option-card flex min-h-20 cursor-pointer items-start gap-4 rounded-3xl border px-4 py-4 transition-all", selected
                                ? "border-primary bg-primary/8 shadow-[0_22px_50px_-32px_rgba(19,72,70,0.65)]"
                                : "border-border/80 bg-white/70 hover:border-primary/25 hover:bg-white"), children: [_jsx(RadioGroupItem, { value: String(choice.value), className: "mt-1 size-5" }), _jsx("span", { className: "text-[clamp(0.98rem,0.88rem+0.28vw,1.08rem)] leading-[1.75]", children: choice.text })] }, String(choice.value)));
                    }) }) }), step.kind === "radiogroup" &&
                currentValue === OTHER_VALUE &&
                otherTextKey !== undefined ? (_jsx(Input, { value: String(answers[otherTextKey] ?? ""), onChange: (event) => setAnswers((prev) => ({
                    ...prev,
                    [otherTextKey]: event.target.value,
                })), placeholder: "\uAE30\uD0C0 \uB0B4\uC6A9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694", className: "h-12 rounded-2xl bg-white/80 px-4 text-sm" })) : null] }));
}
function renderCheckboxStep(step, answers, setAnswers) {
    const currentValues = Array.isArray(getStepValue(step, answers))
        ? getStepValue(step, answers)
        : [];
    const otherTextKey = `${step.name}__other`;
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsx(OptionGrid, { cols: step.colCount ?? 1, children: step.choices.map((choice) => {
                    const checked = currentValues.includes(choice.value);
                    return (_jsxs("label", { className: cn("option-card flex min-h-20 cursor-pointer items-start gap-4 rounded-3xl border px-4 py-4 transition-all", checked
                            ? "border-primary bg-primary/8 shadow-[0_22px_50px_-32px_rgba(19,72,70,0.65)]"
                            : "border-border/80 bg-white/70 hover:border-primary/25 hover:bg-white"), children: [_jsx(Checkbox, { checked: checked, onCheckedChange: (nextChecked) => {
                                    setAnswers((prev) => {
                                        const previousValues = Array.isArray(prev[step.name])
                                            ? [...prev[step.name]]
                                            : [];
                                        let nextValues = previousValues;
                                        if (choice.value === NONE_VALUE && nextChecked) {
                                            nextValues = [NONE_VALUE];
                                        }
                                        else if (nextChecked) {
                                            nextValues = previousValues
                                                .filter((value) => value !== NONE_VALUE)
                                                .concat(choice.value);
                                        }
                                        else {
                                            nextValues = previousValues.filter((value) => value !== choice.value);
                                        }
                                        return {
                                            ...prev,
                                            [step.name]: nextValues,
                                        };
                                    });
                                }, className: "mt-1 size-5" }), _jsx("span", { className: "text-[clamp(1.04rem,0.9rem+0.5vw,1.24rem)] leading-[1.8] tracking-[-0.015em]", children: choice.text })] }, String(choice.value)));
                }) }), currentValues.includes(OTHER_VALUE) ? (_jsx(Input, { value: String(answers[otherTextKey] ?? ""), onChange: (event) => setAnswers((prev) => ({
                    ...prev,
                    [otherTextKey]: event.target.value,
                })), placeholder: "\uAE30\uD0C0 \uB0B4\uC6A9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694", className: "h-12 rounded-2xl bg-white/80 px-4 text-sm" })) : null] }));
}
function renderTextStep(step, answers, setAnswers) {
    const currentValue = getStepValue(step, answers);
    return (_jsx("div", { className: "mx-auto w-full max-w-[80%] rounded-[30px] border border-slate-300/75 bg-white p-3 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)]", children: _jsx(Input, { type: step.inputType, min: step.min, max: step.max, value: currentValue === undefined ? "" : String(currentValue), onChange: (event) => {
                const rawValue = event.target.value;
                const nextValue = step.inputType === "number" ? (rawValue === "" ? "" : Number(rawValue)) : rawValue;
                setAnswers((prev) => setStepValue(step, prev, nextValue));
            }, placeholder: "\uC751\uB2F5\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694", className: "h-16 rounded-[22px] border-slate-300 bg-slate-50 px-5 !text-[clamp(1.1rem,0.96rem+0.46vw,1.35rem)] leading-[1.35] shadow-[inset_0_1px_2px_rgba(15,23,42,0.06)] placeholder:text-[clamp(1rem,0.92rem+0.22vw,1.12rem)] md:!text-[clamp(1.1rem,0.96rem+0.46vw,1.35rem)] focus-visible:border-primary focus-visible:bg-white" }) }));
}
function getMatrixGroupBounds(steps, index) {
    const step = steps[index];
    if (!step || step.kind !== "matrix-row") {
        return null;
    }
    let start = index;
    while (start > 0) {
        const previousStep = steps[start - 1];
        if (!previousStep ||
            previousStep.kind !== "matrix-row" ||
            previousStep.matrixName !== step.matrixName) {
            break;
        }
        start -= 1;
    }
    let end = index;
    while (end < steps.length - 1) {
        const nextStep = steps[end + 1];
        if (!nextStep ||
            nextStep.kind !== "matrix-row" ||
            nextStep.matrixName !== step.matrixName) {
            break;
        }
        end += 1;
    }
    return { start, end };
}
function MatrixCarouselStep({ step, groupSteps, groupStartIndex, answers, setAnswers, currentIndex, onFocusRow, onAdvance, }) {
    const compactChoiceLayout = step.columns.length <= 2;
    const activeRowIndex = currentIndex - groupStartIndex;
    const viewportRef = useRef(null);
    const rowsViewportRef = useRef(null);
    const rowRefs = useRef([]);
    const wheelAccumulatorRef = useRef(0);
    const advanceTimeoutRef = useRef(null);
    const focusStep = groupSteps[activeRowIndex] ?? step;
    const topFade = activeRowIndex > 0;
    const bottomFade = activeRowIndex < groupSteps.length - 1;
    useEffect(() => {
        return () => {
            if (advanceTimeoutRef.current !== null) {
                window.clearTimeout(advanceTimeoutRef.current);
            }
        };
    }, []);
    const moveFocus = useEffectEvent((delta) => {
        const nextIndex = Math.min(Math.max(activeRowIndex + delta, 0), groupSteps.length - 1);
        if (nextIndex !== activeRowIndex) {
            onFocusRow(groupStartIndex + nextIndex);
        }
    });
    const handleWheelIntent = useEffectEvent((deltaY) => {
        wheelAccumulatorRef.current += deltaY;
        if (Math.abs(wheelAccumulatorRef.current) < 30) {
            return;
        }
        moveFocus(wheelAccumulatorRef.current > 0 ? 1 : -1);
        wheelAccumulatorRef.current = 0;
    });
    useEffect(() => {
        const element = viewportRef.current;
        if (!element) {
            return;
        }
        const handleWheel = (event) => {
            event.preventDefault();
            handleWheelIntent(event.deltaY);
        };
        element.addEventListener("wheel", handleWheel, { passive: false });
        return () => element.removeEventListener("wheel", handleWheel);
    }, [handleWheelIntent]);
    useEffect(() => {
        const container = rowsViewportRef.current;
        const activeRow = rowRefs.current[activeRowIndex];
        if (!container || !activeRow) {
            return;
        }
        const rowCenter = activeRow.offsetTop + activeRow.offsetHeight / 2;
        const targetScrollTop = rowCenter - container.clientHeight / 2;
        container.scrollTo({
            top: Math.max(targetScrollTop, 0),
            behavior: "smooth",
        });
    }, [activeRowIndex]);
    function handleRowWheel(event) {
        event.preventDefault();
        handleWheelIntent(event.deltaY);
    }
    function queueAdvance(rowIndex) {
        if (advanceTimeoutRef.current !== null) {
            window.clearTimeout(advanceTimeoutRef.current);
        }
        advanceTimeoutRef.current = window.setTimeout(() => {
            if (rowIndex < groupSteps.length - 1) {
                onFocusRow(groupStartIndex + rowIndex + 1);
                return;
            }
            onAdvance();
        }, 180);
    }
    return (_jsxs("div", { className: "mx-auto flex w-full max-w-6xl flex-col gap-5", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-white/65 bg-white/68 px-5 py-4 shadow-[0_30px_70px_-52px_rgba(19,37,36,0.65)]", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase", children: "Matrix View" }), _jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [focusStep.rowIndex + 1, " / ", groupSteps.length, " rows"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { type: "button", variant: "outline", size: "icon-lg", className: "rounded-full bg-white/75", onClick: () => moveFocus(-1), disabled: activeRowIndex === 0, "aria-label": "Previous row", children: _jsx(ArrowUp, {}) }), _jsx(Button, { type: "button", variant: "outline", size: "icon-lg", className: "rounded-full bg-white/75", onClick: () => moveFocus(1), disabled: activeRowIndex === groupSteps.length - 1, "aria-label": "Next row", children: _jsx(ArrowDown, {}) })] })] }), _jsxs("div", { ref: viewportRef, onWheel: handleRowWheel, className: "matrix-carousel relative overflow-hidden rounded-[32px] border border-white/60 bg-[linear-gradient(180deg,rgba(247,251,250,0.96),rgba(236,243,242,0.92))] p-4 md:p-6", children: [topFade ? _jsx("div", { className: "matrix-carousel__veil matrix-carousel__veil--top" }) : null, bottomFade ? (_jsx("div", { className: "matrix-carousel__veil matrix-carousel__veil--bottom" })) : null, _jsx("div", { className: "overflow-x-auto", children: _jsx("div", { className: "min-w-[680px] w-full md:min-w-0", style: {
                                ["--matrix-column-count"]: String(step.columns.length),
                                ["--matrix-choice-gap"]: compactChoiceLayout
                                    ? "1.5rem"
                                    : "0.75rem",
                            }, children: _jsx("div", { ref: rowsViewportRef, className: "matrix-carousel__viewport overflow-y-auto px-2", children: _jsx("div", { className: "flex flex-col gap-3 py-[14vh]", children: groupSteps.map((rowStep, rowIndex) => {
                                        const rowOffset = rowIndex - activeRowIndex;
                                        const rowState = rowOffset === 0 ? "active" : Math.abs(rowOffset) === 1 ? "near" : "far";
                                        const currentValue = getStepValue(rowStep, answers);
                                        return (_jsxs("div", { ref: (element) => {
                                                rowRefs.current[rowIndex] = element;
                                            }, "data-row-state": rowState, className: cn("matrix-carousel__row grid grid-cols-[minmax(0,40%)_minmax(0,60%)] items-center gap-3 rounded-[28px] border border-white/60 px-3 py-3 transition-[transform,opacity,filter,background-color,box-shadow] duration-300", rowState === "active"
                                                ? "bg-white/92 shadow-[0_28px_75px_-52px_rgba(19,72,70,0.8)]"
                                                : "bg-white/55"), onClick: () => onFocusRow(groupStartIndex + rowIndex), children: [_jsx("div", { className: "flex min-h-24 items-center rounded-[22px] border border-transparent px-4 py-4 text-left", children: _jsxs("div", { children: [_jsxs("div", { className: "text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase", children: ["Row ", rowIndex + 1] }), _jsx("p", { className: "mt-2 break-keep text-[clamp(0.98rem,0.92rem+0.22vw,1.12rem)] leading-7 text-foreground", children: rowStep.rowTitle })] }) }), _jsx("div", { className: cn("grid min-w-0 gap-3", compactChoiceLayout ? "justify-center" : ""), style: {
                                                        gap: "var(--matrix-choice-gap)",
                                                        gridTemplateColumns: compactChoiceLayout
                                                            ? `repeat(${rowStep.columns.length}, minmax(9rem, 11rem))`
                                                            : `repeat(${rowStep.columns.length}, minmax(0, 1fr))`,
                                                    }, children: rowStep.columns.map((column) => {
                                                        const selected = isChoiceSelected(currentValue, column.value);
                                                        return (_jsxs("button", { type: "button", className: cn("matrix-carousel__cell flex h-20 min-w-0 self-center items-center justify-center rounded-[22px] border px-2 py-3 text-center text-sm font-semibold transition-all", selected
                                                                ? "border-primary bg-primary text-primary-foreground shadow-[0_24px_45px_-30px_rgba(19,72,70,0.85)]"
                                                                : "border-border/80 bg-white/86 text-foreground hover:border-primary/35 hover:bg-primary/6"), onClick: (event) => {
                                                                event.stopPropagation();
                                                                setAnswers((prev) => setStepValue(rowStep, prev, column.value));
                                                                queueAdvance(rowIndex);
                                                            }, "aria-pressed": selected, children: [_jsx("span", { className: "sr-only", children: rowStep.rowTitle }), _jsx("span", { className: "matrix-carousel__cell-shell", children: _jsx("span", { className: "matrix-carousel__cell-label", children: column.text }) })] }, String(column.value)));
                                                    }) })] }, rowStep.id));
                                    }) }) }) }) })] }), _jsx("p", { className: "text-center text-sm text-muted-foreground", children: "\uB9C8\uC6B0\uC2A4 \uD720 \uB610\uB294 \uC704\uC544\uB798 \uBC84\uD2BC\uC73C\uB85C \uD589\uC744 \uC774\uB3D9\uD560 \uC218 \uC788\uACE0, \uC751\uB2F5\uD558\uBA74 \uC790\uB3D9\uC73C\uB85C \uB2E4\uC74C \uD589\uC73C\uB85C \uB0B4\uB824\uAC11\uB2C8\uB2E4." })] }));
}
export function QuestionnaireFlow({ questionnaire, formId, onComplete, }) {
    const steps = useMemo(() => normalizeQuestionnaire(questionnaire), [questionnaire]);
    const [answers, setAnswersState] = useState(() => buildInitialAnswers(steps));
    const [currentIndex, setCurrentIndex] = useState(0);
    useEffect(() => {
        setAnswersState(buildInitialAnswers(steps));
        setCurrentIndex(0);
    }, [steps, formId]);
    const setAnswers = (updater) => {
        setAnswersState((previous) => updater(previous));
    };
    const visibleSteps = useMemo(() => steps.filter((step) => evaluateVisibleIf(step.visibleIf, answers)), [answers, steps]);
    useEffect(() => {
        if (visibleSteps.length === 0) {
            return;
        }
        if (currentIndex >= visibleSteps.length) {
            setCurrentIndex(visibleSteps.length - 1);
        }
    }, [currentIndex, visibleSteps.length]);
    const currentStep = visibleSteps[currentIndex];
    const progressValue = visibleSteps.length === 0 ? 0 : ((currentIndex + 1) / visibleSteps.length) * 100;
    if (!currentStep) {
        return null;
    }
    const title = currentStep.kind === "matrix-row" ? currentStep.rowTitle : currentStep.title;
    const titleSizing = getTitleSizing(title);
    const titleParts = splitParenthetical(title);
    const canGoBack = currentIndex > 0;
    const canGoForward = isValid(currentStep, answers);
    const isLastStep = currentIndex === visibleSteps.length - 1;
    const answeredCount = visibleSteps.filter((step) => isAnswered(step, answers)).length;
    const matrixGroup = currentStep.kind === "matrix-row"
        ? getMatrixGroupBounds(visibleSteps, currentIndex)
        : null;
    const matrixGroupSteps = matrixGroup === null
        ? []
        : visibleSteps.slice(matrixGroup.start, matrixGroup.end + 1);
    const matrixCurrentGroupIndex = matrixGroup === null ? 0 : currentIndex - matrixGroup.start;
    const currentDisplayIndex = currentStep.kind === "matrix-row"
        ? matrixCurrentGroupIndex + 1
        : currentIndex + 1;
    const totalDisplayCount = currentStep.kind === "matrix-row" ? matrixGroupSteps.length : visibleSteps.length;
    function goNext() {
        if (!canGoForward) {
            return;
        }
        if (isLastStep) {
            onComplete?.({
                answers,
                completedSteps: answeredCount,
                totalSteps: visibleSteps.length,
            });
            return;
        }
        setCurrentIndex((previous) => Math.min(previous + 1, visibleSteps.length - 1));
    }
    return (_jsxs(Card, { className: "questionnaire-js glass-panel overflow-visible rounded-[32px] border-white/60 bg-white/68 py-0 shadow-[0_40px_120px_-58px_rgba(20,42,41,0.55)] backdrop-blur-xl", children: [_jsx(CardHeader, { className: "gap-4 border-b border-white/60 px-6 py-5 md:px-8 md:py-6", children: _jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsx("p", { className: "text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase", children: currentStep.kind === "matrix-row"
                                                ? currentStep.matrixTitle ??
                                                    currentStep.panelTitle ??
                                                    currentStep.formTitle ??
                                                    questionnaire.title ??
                                                    questionnaire.pages[0]?.title ??
                                                    "Questionnaire"
                                                : currentStep.formTitle ??
                                                    questionnaire.title ??
                                                    questionnaire.pages[0]?.title ??
                                                    "Questionnaire" }), _jsxs("div", { className: "rounded-full border border-white/70 bg-white/75 px-3 py-2 text-sm text-muted-foreground shadow-sm", children: [currentDisplayIndex, " / ", totalDisplayCount] })] }), _jsxs(Button, { type: "button", variant: "ghost", size: "lg", onClick: () => setAnswers((prev) => clearStepValue(currentStep, prev)), className: "h-11 rounded-full bg-white/75 px-4 hover:bg-white", children: [_jsx(Eraser, { "data-icon": "inline-start" }), "Clear"] })] }), _jsx(CardDescription, { className: "max-w-5xl break-keep text-sm leading-7 text-muted-foreground md:text-base", children: (currentStep.kind === "matrix-row"
                                ? currentStep.matrixDescription
                                : undefined) ??
                                currentStep.description ??
                                currentStep.panelTitle ??
                                currentStep.pageDescription ??
                                currentStep.formDescription }), _jsx(Progress, { value: progressValue, className: "h-2 rounded-full bg-black/8" }), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground", children: [_jsxs("div", { className: "inline-flex items-center gap-2", children: [_jsx(ListChecks, { className: "size-4" }), _jsxs("span", { children: [answeredCount, " answered"] })] }), _jsx("span", { children: currentStep.kind === "matrix-row"
                                        ? currentStep.pageTitle ?? currentStep.formTitle
                                        : currentStep.panelTitle ?? currentStep.pageTitle ?? currentStep.formTitle })] })] }) }), _jsxs(CardContent, { className: "px-6 py-7 md:px-8 md:py-8", children: [currentStep.kind === "matrix-row" ? (_jsx(MatrixCarouselStep, { step: currentStep, groupSteps: matrixGroupSteps, groupStartIndex: matrixGroup?.start ?? currentIndex, answers: answers, setAnswers: setAnswers, currentIndex: currentIndex, onFocusRow: setCurrentIndex, onAdvance: goNext })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: cn("mx-auto mb-8 flex flex-col items-center text-center", titleSizing.container), children: [_jsx(CardTitle, { className: cn("break-keep font-semibold text-balance", titleSizing.titleClass), children: titleParts.main }), titleParts.aside ? (_jsx("p", { className: cn("max-w-4xl break-keep text-muted-foreground text-balance", titleSizing.asideClass), children: titleParts.aside })) : null] }), currentStep.kind === "text"
                                ? renderTextStep(currentStep, answers, setAnswers)
                                : currentStep.kind === "checkbox"
                                    ? renderCheckboxStep(currentStep, answers, setAnswers)
                                    : renderRadioStep(currentStep, answers, setAnswers)] })), _jsxs("div", { className: "mt-8 flex flex-col gap-3 border-t border-white/60 pt-6 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs(Button, { type: "button", variant: "outline", size: "lg", disabled: !canGoBack, onClick: () => setCurrentIndex((previous) => Math.max(previous - 1, 0)), className: "h-12 rounded-full bg-white/72 px-5", children: [_jsx(ArrowLeft, { "data-icon": "inline-start" }), "Previous"] }), _jsxs("div", { className: "flex items-center gap-3", children: [currentStep.isRequired && !canGoForward ? (_jsx("p", { className: "text-sm text-destructive", children: "\uD544\uC218 \uC9C8\uBB38\uC785\uB2C8\uB2E4. \uC751\uB2F5 \uD6C4 \uB2E4\uC74C\uC73C\uB85C \uC9C4\uD589\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4." })) : null, _jsxs(Button, { type: "button", size: "lg", disabled: !canGoForward, onClick: goNext, className: "h-12 rounded-full px-6 shadow-[0_24px_55px_-28px_rgba(19,72,70,0.75)]", children: [_jsx(CircleDot, { "data-icon": "inline-start" }), isLastStep ? "Complete" : "Continue", !isLastStep ? _jsx(ArrowRight, { "data-icon": "inline-end" }) : null] })] })] })] })] }));
}
