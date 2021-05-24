describe("Sisselogimise testimine", () => {

    it("Kasutaja saab sisse logida e-posti ja parooli kaudu", () => {
        cy.visit("/");
        cy.get("input[name=email]").type(Cypress.env('CYPRESS_email'));
        cy.get("input[name=password]").type(Cypress.env('CYPRESS_password'), { log: false });
        cy.get(".btn-primary").click();
        cy.contains("See lehekülg on loodud");
    });

    it("E-posti aadress on vale", () => {
        cy.visit("/");
        cy.get("input[name=email]").type("andreeli@khk.ee");
        cy.get(".btn-primary").click();
        cy.contains("Vale e-posti aadress!");
    });

    it("Parool on vale", () => {
        cy.visit("/");
        cy.get("input[name=email").type(Cypress.env('CYPRESS_email'));
        cy.get("input[name=password]").type("test");
        cy.get(".btn-primary").click();
        cy.contains("Vale parool!");
    });
});