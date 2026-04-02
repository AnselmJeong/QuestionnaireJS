const OTHER_VALUE = "__other__";
const NONE_VALUE = "__none__";
function normalizeChoice(choice) {
    if (typeof choice === "object" && choice !== null && "value" in choice) {
        return {
            value: choice.value,
            text: choice.text,
        };
    }
    return {
        value: choice,
        text: String(choice),
    };
}
function deterministicShuffle(items, seedSource) {
    const seed = Array.from(seedSource).reduce((total, character, index) => total + character.charCodeAt(0) * (index + 1), 0);
    const cloned = [...items];
    for (let index = cloned.length - 1; index > 0; index -= 1) {
        const swapIndex = (seed + index * 17) % (index + 1);
        [cloned[index], cloned[swapIndex]] = [cloned[swapIndex], cloned[index]];
    }
    return cloned;
}
function normalizeChoices(element) {
    const baseChoices = element.choices.map(normalizeChoice);
    const orderedChoices = "choicesOrder" in element && element.choicesOrder === "random"
        ? deterministicShuffle(baseChoices, `${element.name}:${element.title ?? ""}`)
        : baseChoices;
    const expandedChoices = [...orderedChoices];
    if (element.showNoneItem) {
        expandedChoices.push({ value: NONE_VALUE, text: "없음" });
    }
    if (element.showOtherItem) {
        expandedChoices.push({ value: OTHER_VALUE, text: "기타" });
    }
    return expandedChoices;
}
function createTextStep(form, page, element, panel) {
    const inferredInputType = element.maskType === "date" ? "date" : element.inputType ?? "text";
    return {
        id: element.name,
        kind: "text",
        sourceType: element.type,
        name: element.name,
        title: element.title ?? element.name,
        description: element.description,
        isRequired: Boolean(element.isRequired),
        visibleIf: element.visibleIf,
        pageTitle: page.title,
        pageDescription: page.description,
        panelTitle: panel?.title,
        panelDescription: panel?.description,
        formTitle: form.title,
        formDescription: form.description,
        inputType: inferredInputType,
        min: element.min,
        max: element.max,
        defaultValue: element.defaultValue,
    };
}
function createRadioStep(form, page, element, panel) {
    return {
        id: element.name,
        kind: "radiogroup",
        sourceType: element.type,
        name: element.name,
        title: element.title ?? element.name,
        description: element.description,
        isRequired: Boolean(element.isRequired),
        visibleIf: element.visibleIf,
        pageTitle: page.title,
        pageDescription: page.description,
        panelTitle: panel?.title,
        panelDescription: panel?.description,
        formTitle: form.title,
        formDescription: form.description,
        choices: normalizeChoices(element),
        allowOther: Boolean(element.showOtherItem),
        allowNone: Boolean(element.showNoneItem),
        colCount: element.colCount,
        defaultValue: element.defaultValue,
    };
}
function createCheckboxStep(form, page, element, panel) {
    return {
        id: element.name,
        kind: "checkbox",
        sourceType: element.type,
        name: element.name,
        title: element.title ?? element.name,
        description: element.description,
        isRequired: Boolean(element.isRequired),
        visibleIf: element.visibleIf,
        pageTitle: page.title,
        pageDescription: page.description,
        panelTitle: panel?.title,
        panelDescription: panel?.description,
        formTitle: form.title,
        formDescription: form.description,
        choices: normalizeChoices(element),
        allowOther: Boolean(element.showOtherItem),
        allowNone: Boolean(element.showNoneItem),
        colCount: element.colCount,
        defaultValue: element.defaultValue,
    };
}
function createBooleanStep(form, page, element, panel) {
    return {
        id: element.name,
        kind: "boolean",
        sourceType: element.type,
        name: element.name,
        title: element.title ?? element.name,
        description: element.description,
        isRequired: Boolean(element.isRequired),
        visibleIf: element.visibleIf,
        pageTitle: page.title,
        pageDescription: page.description,
        panelTitle: panel?.title,
        panelDescription: panel?.description,
        formTitle: form.title,
        formDescription: form.description,
        choices: [
            { value: true, text: "예" },
            { value: false, text: "아니오" },
        ],
        defaultValue: element.defaultValue,
    };
}
function createMatrixSteps(form, page, element, panel) {
    const rowsAreRequired = Boolean(element.isRequired || element.isAllRowRequired || element.eachRowRequired);
    return element.rows.map((row, index) => ({
        id: `${element.name}.${row.value}.${index}`,
        kind: "matrix-row",
        sourceType: element.type,
        name: `${element.name}.${row.value}`,
        matrixName: element.name,
        matrixTitle: element.title,
        matrixDescription: element.description,
        rowName: row.value,
        rowTitle: row.text,
        title: row.text,
        description: element.description,
        rowIndex: index,
        totalRows: element.rows.length,
        isRequired: rowsAreRequired,
        visibleIf: element.visibleIf,
        pageTitle: page.title,
        pageDescription: page.description,
        panelTitle: panel?.title ?? element.title,
        panelDescription: panel?.description,
        formTitle: form.title,
        formDescription: form.description,
        columns: element.columns.map(normalizeChoice),
        defaultValue: element.defaultValue?.[row.value],
    }));
}
function normalizeElement(form, page, element, panel) {
    switch (element.type) {
        case "text":
            return [createTextStep(form, page, element, panel)];
        case "radiogroup":
            return [createRadioStep(form, page, element, panel)];
        case "checkbox":
            return [createCheckboxStep(form, page, element, panel)];
        case "boolean":
            return [createBooleanStep(form, page, element, panel)];
        case "matrix":
            return createMatrixSteps(form, page, element, panel);
        case "panel":
            return element.elements.flatMap((child) => normalizeElement(form, page, child, element));
        default:
            return [];
    }
}
export function normalizeQuestionnaire(questionnaire) {
    return questionnaire.pages.flatMap((page) => page.elements.flatMap((element) => normalizeElement(questionnaire, page, element)));
}
export { NONE_VALUE, OTHER_VALUE };
