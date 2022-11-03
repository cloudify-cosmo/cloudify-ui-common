import '@cypress/code-coverage/support';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CustomCypressCommands = Record<string, (...args: any[]) => Cypress.Chainable | void>;

/**
 * Returns an object that contains custom Cypress commands with correct return types
 * (Cypress.Chainable)
 */
export type GetCypressChainableFromCommands<CustomCommands extends CustomCypressCommands> = {
    [P in keyof CustomCommands]: void extends ReturnType<CustomCommands[P]>
        ? (...args: Parameters<CustomCommands[P]>) => Cypress.Chainable
        : CustomCommands[P];
};

declare global {
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        export interface Chainable extends GetCypressChainableFromCommands<typeof commands> {}
    }
}

export const addCommands = (commands: CustomCypressCommands): void =>
    Object.entries(commands).forEach(([name, command]) => {
        Cypress.Commands.add(name as keyof Cypress.Chainable, command);
    });

const commands = {
    getAdminToken: () =>
        cy
            .request({
                method: 'POST',
                url: '/console/sp/tokens',
                headers: {
                    Authorization: `Basic ${btoa('admin:admin')}`,
                    'Content-Type': 'application/json'
                },
                body: {
                    description: 'UI tests authentication token',
                    expiration_date: '+10h'
                }
            })
            .then(response => response.body.value)
};

addCommands(commands);
