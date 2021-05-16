describe("Koostatud raportite vaatamine", () => {

    before(() => {
        const email = "andre.eli@khk.ee";
        const password = "Te$tija1";
        cy.visit("/");
        cy.get("input[name=email").type(email);
        cy.get("input[name=password").type(password);
        cy.get(".btn-primary").click();
        cy.contains("See lehekülg on loodud");
    });

    beforeEach(() => {
        Cypress.Cookies.preserveOnce('sid');
    });


    it("Kasutaja saab loodud raportit vaadata", () => {

        cy.get(".nav-link").contains("Raportid").click();
        cy.contains("Ettevõte OÜ").click();
        cy.get("#headingOne").click();
        cy.wait(500);
        cy.get("#headingTwo").click();
        cy.wait(500);
        cy.get("#headingThree").click();
        cy.wait(500);
        cy.get("#headingFour").click();
        cy.wait(500);
    });

    it("Kasutaja saab tagasi minna", ()=> {
        cy.get("#returReport").click();
        cy.contains("Koostatud raportid");
    });
});