Cypress.Commands.add('getAdminToken', () =>
    cy
        .request({
            method: 'GET',
            url: '/console/sp',
            qs: {
                su: '/tokens'
            },
            headers: {
                Authorization: `Basic ${btoa('admin:admin')}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.body.value)
);
