export const Err = (error) => [null, error];
export const Ok = (result) => [result, null];
export const isErr = (result) => result[0] === null && result[1] !== null;
export const isOk = (result) => result[0] !== null && result[1] === null;
//# sourceMappingURL=result.js.map