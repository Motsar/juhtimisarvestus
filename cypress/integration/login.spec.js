describe("Sisselogimise testimine", () => {

    const email = "andre.eli@khk.ee";
    const password = "Te$tija1";

    it("Kasutaja saab sisse logida e-posti ja parooli kaudu", () => {
        cy.visit("/");
        cy.get("input[name=email").type(email);
        cy.get("input[name=password").type(password);
        cy.get(".btn-primary").click();
        cy.contains("See lehekülg on loodud");
    });

    it("E-posti aadress on vale", () => {
        cy.visit("/");
        cy.get("input[name=email").type("andreeli@khk.ee");
        cy.get(".btn-primary").click();
        cy.contains("Vale e-posti aadress!");
    });

    it("Parool on vale", () => {
        cy.visit("/");
        cy.get("input[name=email").type(email);
        cy.get("input[name=password").type("test");
        cy.get(".btn-primary").click();
        cy.contains("Vale parool!");
    });
});