export type PrimitiveChoice = string | number | boolean;

export type ChoiceObject = {
  value: PrimitiveChoice | string;
  text: string;
};

export type ChoiceValue = PrimitiveChoice | ChoiceObject;

export type SurveyBaseElement = {
  type: string;
  name: string;
  title?: string;
  description?: string;
  isRequired?: boolean;
  visibleIf?: string;
};

export type TextQuestion = SurveyBaseElement & {
  type: "text";
  inputType?: "text" | "number" | "time" | "date";
  maskType?: "date";
  min?: number;
  max?: number;
  defaultValue?: string | number;
};

export type RadioQuestion = SurveyBaseElement & {
  type: "radiogroup";
  choices: ChoiceValue[];
  showOtherItem?: boolean;
  showNoneItem?: boolean;
  choicesOrder?: "random";
  colCount?: number;
  defaultValue?: PrimitiveChoice | string;
};

export type CheckboxQuestion = SurveyBaseElement & {
  type: "checkbox";
  choices: ChoiceValue[];
  showOtherItem?: boolean;
  showNoneItem?: boolean;
  colCount?: number;
  defaultValue?: Array<PrimitiveChoice | string>;
};

export type BooleanQuestion = SurveyBaseElement & {
  type: "boolean";
  defaultValue?: boolean;
};

export type MatrixColumn = ChoiceObject;

export type MatrixRow = {
  value: string;
  text: string;
};

export type MatrixQuestion = SurveyBaseElement & {
  type: "matrix";
  columns: MatrixColumn[];
  rows: MatrixRow[];
  isAllRowRequired?: boolean;
  eachRowRequired?: boolean;
  defaultValue?: Record<string, PrimitiveChoice | string>;
};

export type PanelQuestion = SurveyBaseElement & {
  type: "panel";
  elements: SurveyElement[];
};

export type SurveyElement =
  | TextQuestion
  | RadioQuestion
  | CheckboxQuestion
  | BooleanQuestion
  | MatrixQuestion
  | PanelQuestion;

export type QuestionnairePage = {
  name?: string;
  title?: string;
  description?: string;
  elements: SurveyElement[];
};

export type QuestionnaireSchema = {
  title?: string;
  description?: string;
  pages: QuestionnairePage[];
};

export type QuestionnaireAnswers = Record<string, unknown>;

export type NormalizedChoice = {
  value: PrimitiveChoice | string;
  text: string;
};

export type BaseStep = {
  id: string;
  kind: "text" | "radiogroup" | "checkbox" | "boolean" | "matrix-row";
  sourceType: SurveyElement["type"];
  name: string;
  title: string;
  description?: string;
  isRequired: boolean;
  visibleIf?: string;
  pageTitle?: string;
  pageDescription?: string;
  panelTitle?: string;
  panelDescription?: string;
  formTitle?: string;
  formDescription?: string;
  defaultValue?: unknown;
};

export type TextStep = BaseStep & {
  kind: "text";
  inputType: "text" | "number" | "time" | "date";
  min?: number;
  max?: number;
};

export type RadioStep = BaseStep & {
  kind: "radiogroup";
  choices: NormalizedChoice[];
  allowOther: boolean;
  allowNone: boolean;
  colCount?: number;
};

export type CheckboxStep = BaseStep & {
  kind: "checkbox";
  choices: NormalizedChoice[];
  allowOther: boolean;
  allowNone: boolean;
  colCount?: number;
};

export type BooleanStep = BaseStep & {
  kind: "boolean";
  choices: [NormalizedChoice, NormalizedChoice];
};

export type MatrixRowStep = BaseStep & {
  kind: "matrix-row";
  matrixName: string;
  matrixTitle?: string;
  matrixDescription?: string;
  rowName: string;
  rowTitle: string;
  rowIndex: number;
  totalRows: number;
  columns: NormalizedChoice[];
};

export type NormalizedStep =
  | TextStep
  | RadioStep
  | CheckboxStep
  | BooleanStep
  | MatrixRowStep;

export type QuestionnaireResult = {
  answers: QuestionnaireAnswers;
  completedSteps: number;
  totalSteps: number;
};
