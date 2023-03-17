/**
 * Creates instrinsic function invocation object
 *
 * @param name
 * @param arg
 */
export function createIntrinsicFunctionCall(
    name: 'get_secret' | 'get_input' | 'get_attribute' | 'get_sys' | 'concat',
    arg: any
) {
    return { [name]: arg };
}

export type IntrinsicFunction = ReturnType<typeof createIntrinsicFunctionCall>;

/**
 * Creates `get_secret` intrinsic function invocation object
 *
 * @param arg
 */
export function createGetSecretCall(arg: string) {
    return createIntrinsicFunctionCall('get_secret', arg);
}

/**
 * Creates `get_input` intrinsic function invocation object
 *
 * @param arg
 */
export function createGetInputCall(arg: string) {
    return createIntrinsicFunctionCall('get_input', arg);
}

type AtLeastOneArgFunction<Arg> = (arg1: Arg, ...restArgs: Arg[]) => IntrinsicFunction;

/**
 * Creates `get_attribute` intrinsic function invocation object
 *
 * @param arg1
 * @param {...any} restArgs
 */
export const createGetAttributeCall: AtLeastOneArgFunction<string | number> = (arg1, ...restArgs) => {
    return createIntrinsicFunctionCall('get_attribute', [arg1, ...restArgs]);
};

/**
 * Creates `get_sys` intrinsic function invocation object
 *
 * @param arg1
 * @param {...any} restArgs
 */
export const createGetSysCall: AtLeastOneArgFunction<string> = (arg1, ...restArgs) => {
    return createIntrinsicFunctionCall('get_sys', [arg1, ...restArgs]);
};

/**
 * Creates `concat` intrinsic function invocation object
 *
 * @param arg1
 * @param {...any} restArgs
 */
export const createConcatCall: AtLeastOneArgFunction<string | IntrinsicFunction> = (arg1, ...restArgs) => {
    return createIntrinsicFunctionCall('concat', [arg1, ...restArgs]);
};
