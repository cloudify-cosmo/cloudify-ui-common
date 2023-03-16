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

/**
 * Creates `get_attribute` intrinsic function invocation object
 *
 * @param {...any} args
 */
export function createGetAttributeCall(...args: (string | number)[]) {
    return createIntrinsicFunctionCall('get_attribute', args);
}

/**
 * Creates `get_sys` intrinsic function invocation object
 *
 * @param {...any} args
 */
export function createGetSysCall(...args: string[]) {
    return createIntrinsicFunctionCall('get_sys', args);
}

/**
 * Creates `concat` intrinsic function invocation object
 *
 * @param {...any} args
 */
export function createConcatCall(...args: (string | IntrinsicFunction)[]) {
    return createIntrinsicFunctionCall('concat', args);
}
