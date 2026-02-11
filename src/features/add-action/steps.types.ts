export type StepHandle = {
  submit: () => Promise<boolean>; // return success
  reset?: () => void;
};
