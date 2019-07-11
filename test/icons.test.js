const icons = require('./../dist/cloudify-ui-common.cjs').icons;

describe('getNodeIcon', () => {
  test('handles empty string', () => {
    expect(icons.getNodeIcon("")).toBe("\ue616");
  });

  test('handles string', () => {
    expect(icons.getNodeIcon("cloudify.nodes.Compute")).toBe("\ue61b");
  });

  test('handles empty array', () => {
    expect(icons.getNodeIcon([])).toBe("\ue616");
  });

  test('handles array', () => {
    expect(icons.getNodeIcon(['cloudify.nodes.Compute', 'cloudify.nodes.Root'])).toBe("\ue61b");
  });

  test('handles invalid input', () => {
    expect(icons.getNodeIcon(555)).toBe("\ue616");
  });
});
