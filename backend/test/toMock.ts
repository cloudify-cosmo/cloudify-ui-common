/**
 * @param value any kind of value
 *
 * @returns jest.Mock
 */
export default function toMock(value: unknown): jest.Mock {
    return <jest.Mock>(<unknown>value);
}
