function resolveValue(path, answers) {
    return path.split(".").reduce((current, segment) => {
        if (current && typeof current === "object" && segment in current) {
            return current[segment];
        }
        return undefined;
    }, answers);
}
function parseLiteral(rawLiteral) {
    const trimmed = rawLiteral.trim();
    if ((trimmed.startsWith("'") && trimmed.endsWith("'")) ||
        (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
        return trimmed.slice(1, -1);
    }
    if (trimmed === "true") {
        return true;
    }
    if (trimmed === "false") {
        return false;
    }
    if (!Number.isNaN(Number(trimmed))) {
        return Number(trimmed);
    }
    return trimmed;
}
export function evaluateVisibleIf(expression, answers) {
    if (!expression) {
        return true;
    }
    const match = expression.match(/^\s*\{([^}]+)\}\s*(==|!=|>=|<=|>|<)\s*(.+?)\s*$/);
    if (!match) {
        return true;
    }
    const [, path, operator, literal] = match;
    const leftValue = resolveValue(path, answers);
    const rightValue = parseLiteral(literal);
    switch (operator) {
        case "==":
            return leftValue === rightValue;
        case "!=":
            return leftValue !== rightValue;
        case ">":
            return Number(leftValue) > Number(rightValue);
        case "<":
            return Number(leftValue) < Number(rightValue);
        case ">=":
            return Number(leftValue) >= Number(rightValue);
        case "<=":
            return Number(leftValue) <= Number(rightValue);
        default:
            return true;
    }
}
