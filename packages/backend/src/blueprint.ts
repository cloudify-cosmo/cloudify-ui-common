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
 * @param {...any} args
 */
export const createGetAttributeCall: AtLeastOneArgFunction<string | number> = (...args) => {
    return createIntrinsicFunctionCall('get_attribute', args);
};

/**
 * Creates `get_sys` intrinsic function invocation object
 *
 * @param arg1
 * @param {...any} restArgs
 * @param {...any} args
 */
export const createGetSysCall: AtLeastOneArgFunction<string> = (...args) => {
    return createIntrinsicFunctionCall('get_sys', args);
};

/**
 * Creates `concat` intrinsic function invocation object
 *
 * @param {...any} args
 */
export const createConcatCall: AtLeastOneArgFunction<string | IntrinsicFunction> = (...args) => {
    return createIntrinsicFunctionCall('concat', args);
};
