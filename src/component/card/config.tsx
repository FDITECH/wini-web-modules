export const regexUrlWithVariables = /^(https?:\/\/)?([\w.-]+)?(:\d+)?(\/(\$\{[\w.]+\}|[\w.-]*))*$/;
export const regexGetVariableByThis = /\${this\.(\w+)}/g;
