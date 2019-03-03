
// eslint-disable-next-line max-params
export const createQuestion =
  (question, type, value, defaultValue, choices=[])=> ({
    message: question,
    type,
    default: defaultValue,
    name: value,
    choices
  });
