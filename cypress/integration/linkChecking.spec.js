describe("Menüülinkide kontrollimine", () => {
    before(() => {
        cy.visit("/");
        cy.get("input[name=email]").type(Cypress.env('CYPRESS_email'));
        cy.get("input[name=password]").type(Cypress.env('CYPRESS_password'), { log: false });
        cy.get(".btn-primary").click();
        cy.contains("See lehekülg on loodud");
    });

    beforeEach(() => {
        Cypress.Cookies.preserveOnce('sid');
    });

    it("Uue raporti link töötab", () => {
        cy.get(".nav-link").contains("Uus raport").click();
        cy.get(".card-header").contains("Ettevõtte andmed");
    });

    it("Koostatud raportite link töötab", () => {
        cy.get(".nav-link").contains("Raportid").click();
        cy.get(".card-header").contains("Koostatud raportid");
    });

    it("Juhendite link töötab", () => {
        cy.get(".nav-link").contains("Juhend").click();
        cy.get("h1").contains("Kasutusjuhend");
    });

    it("Valemite link töötab", () => {
        cy.get(".nav-link").contains("Valemid").click();
        cy.get("h1").contains("Valemid");
    });

    it("Kasutaja seadete link töötab", () => {
        cy.get("#settings").click();
        cy.get("h1").contains("Kasutaja seaded");
    });

    it("Avalehe link töötab", () => {
        cy.get(".nav-link").contains("Avaleht").click();
        cy.get("h4").contains("See lehekülg on loodud");
    });

    it("Välja logimise link töötab", () => {
        cy.get(".nav-link").contains("Logi välja").click();
        cy.get("h1").contains("Autoriseerimine");
    });
});