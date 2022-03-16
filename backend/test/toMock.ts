/**
 * @param value any kind of value
 */
export default function toMock(value: unknown): jest.Mock {
    return <jest.Mock>(<unknown>value);
}
