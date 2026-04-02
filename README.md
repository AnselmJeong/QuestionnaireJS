# `questionnaire-js`

Lightweight React questionnaire renderer inspired by SurveyJS, optimized for one-question-at-a-time flows.

This package is meant for personal or product use cases where you want:

- SurveyJS-style JSON input
- a much lighter mental model
- one question visible at a time
- polished UI out of the box
- React integration without building a form engine from scratch

## Features

- One-question-at-a-time questionnaire flow
- SurveyJS-like `pages` / `elements` JSON structure
- Built-in progress UI
- Beautiful default styling
- Works with `radiogroup`, `checkbox`, `text`, `boolean`, `matrix`, `panel`
- Supports `visibleIf`
- Supports `showOtherItem` and `showNoneItem`
- Matrix questions are flattened into row-by-row steps

## Install

```bash
npm install questionnaire-js
```

Peer dependencies:

- `react`
- `react-dom`

## Basic Usage

```tsx
import { QuestionnaireFlow, type QuestionnaireSchema } from "questionnaire-js";
import "questionnaire-js/style.css";

const questionnaire: QuestionnaireSchema = {
  title: "Example Questionnaire",
  pages: [
    {
      title: "Basic Info",
      elements: [
        {
          type: "text",
          name: "name",
          title: "What is your name?",
          isRequired: true,
        },
        {
          type: "radiogroup",
          name: "mood",
          title: "How are you feeling today?",
          isRequired: true,
          choices: ["Good", "Okay", "Bad"],
        },
      ],
    },
  ],
};

export function App() {
  return (
    <QuestionnaireFlow
      questionnaire={questionnaire}
      onComplete={(result) => {
        console.log(result.answers);
      }}
    />
  );
}
```

## Input Format

The component expects a SurveyJS-like JSON object:

```ts
type QuestionnaireSchema = {
  title?: string;
  description?: string;
  pages: Array<{
    name?: string;
    title?: string;
    description?: string;
    elements: SurveyElement[];
  }>;
};
```

Example:

```json
{
  "title": "Simple Survey",
  "pages": [
    {
      "title": "Page 1",
      "elements": [
        {
          "type": "text",
          "name": "username",
          "title": "Your name"
        },
        {
          "type": "radiogroup",
          "name": "satisfaction",
          "title": "How satisfied are you?",
          "choices": ["Low", "Medium", "High"]
        }
      ]
    }
  ]
}
```

## Supported Question Types

### `text`

```json
{
  "type": "text",
  "name": "name",
  "title": "Your name",
  "inputType": "text"
}
```

Supported input variants:

- `text`
- `number`
- `time`
- `date`

### `radiogroup`

```json
{
  "type": "radiogroup",
  "name": "gender",
  "title": "Gender",
  "choices": ["Male", "Female"],
  "showOtherItem": true,
  "showNoneItem": true
}
```

### `checkbox`

```json
{
  "type": "checkbox",
  "name": "employment_status",
  "title": "Employment status",
  "choices": ["Full-time", "Part-time", "Student"]
}
```

### `boolean`

```json
{
  "type": "boolean",
  "name": "simultaneity",
  "title": "Did these happen at the same time?"
}
```

### `matrix`

Matrix questions are rendered as one row per step.

```json
{
  "type": "matrix",
  "name": "bai_matrix",
  "title": "How much did these symptoms bother you?",
  "columns": [
    { "value": 0, "text": "Not at all" },
    { "value": 1, "text": "A little" },
    { "value": 2, "text": "Moderately" }
  ],
  "rows": [
    { "value": "bai_01", "text": "Numbness or tingling" },
    { "value": "bai_02", "text": "Feeling hot" }
  ]
}
```

Returned answer shape:

```json
{
  "bai_matrix": {
    "bai_01": 1,
    "bai_02": 2
  }
}
```

### `panel`

Nested `panel.elements` are flattened into the flow while preserving titles and `visibleIf`.

## Conditional Visibility

`visibleIf` is supported for simple expressions like:

```json
{
  "type": "text",
  "name": "diagnosis_detail",
  "title": "Please describe the diagnosis",
  "visibleIf": "{medical_diagnosis_experience} == 'yes'"
}
```

Currently supported operators:

- `==`
- `!=`
- `>`
- `<`
- `>=`
- `<=`

## Return Value

`onComplete` receives:

```ts
type QuestionnaireResult = {
  answers: Record<string, unknown>;
  completedSteps: number;
  totalSteps: number;
};
```

Example:

```ts
onComplete={(result) => {
  console.log(result.answers);
}}
```

## Styling

Default styles are included in:

```ts
import "questionnaire-js/style.css";
```

If you skip this import, the component will render without the intended UI styling.

## Local Development

Start the demo app:

```bash
npm install
npm run dev
```

Build the reusable library:

```bash
npm run build:lib
```

Build the demo app:

```bash
npm run build:demo
```

Check the package tarball contents:

```bash
npm run pack:check
```

## Using It In Another Local Project

Create a local tarball:

```bash
npm run build:lib
npm pack
```

Then install that tarball in another project:

```bash
npm install /absolute/path/to/questionnaire-js-0.1.0.tgz
```

## Current Scope

This library is intentionally lightweight. It does not aim to fully replicate SurveyJS.

Good fit:

- personal projects
- internal tools
- guided questionnaires
- mental health / assessment flows
- intake forms with conditional questions

Not yet included:

- full SurveyJS expression support
- validation rules beyond current built-in handling
- theming API
- plugin architecture
- server-side persistence helpers

## Exports

```ts
import {
  QuestionnaireFlow,
  type QuestionnaireSchema,
  type QuestionnaireResult,
} from "questionnaire-js";
```

## Notes

- The current UI is opinionated by design.
- The package is React-first.
- If you want this to evolve into a more generic engine, the next step would be separating:
  - schema engine
  - UI renderer
  - theme layer

