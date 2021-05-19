describe("Ettevõtte loomine", () => {

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

    it("Kasutaja saab sisestada ettevõtte andmed", () => {

        const timestamp = Math.round(new Date() / 1000);

        const companyName = "Ettevõte OÜ " + timestamp;
        const registryNr = "12345678";
        const compAddress = "Kopli 1";
        const compEmail = "ettevote@khk.ee";
        const compPhone = "5556664";
        const compAdditional = "Loome uue ettevõtte";

        // Ettevõtte lisamine
        cy.get(".nav-link").contains("Uus raport").click();
        cy.get("input[name=compName").type(companyName);
        cy.get("input[name=regNum").type(registryNr);
        cy.get("input[name=adress").type(compAddress);
        cy.get("input[name=comp_email").type(compEmail);
        cy.get("input[name=phone").type(compPhone);
        cy.get("textarea[name=additional_info").type(compAdditional);
        cy.get(".form-check-label").contains("Skeem 2").click();
        cy.get("input[name=vat_obligatory").click();
        cy.get(".form-check-label").contains("365").click();
        cy.get(".btn-primary").contains("Salvesta", { matchCase: false }).click();
        cy.waitUntil(() => cy.contains("Ettevõtte andmed on salvestatud"));
        cy.wait(500);
    });

    // Kasumiaruannete lisamine

    it("Kasutaja saab kasumiaruandeid lisada", () => {
        cy.get(".btn-primary").contains("Kasumiaruanne", { matchCase: false }).click();
        cy.wait(1000);
        cy.get("#kasumiAruandeModal > div > div > div.modal-body > button").click();
        cy.contains("Aasta").parent('tr').within(() => {
            cy.get('td').eq(0).type("2019");
            cy.get('td').eq(1).type("2020");
            cy.get('td').eq(2).type("2021")
        });
        cy.get(".modal-footer").contains("Salvesta", { matchCase: false}).click();
        cy.waitUntil(() => cy.contains("Kasumiaruanded on salvestatud"));
        cy.get(".btn-secondary").contains("Sulge", { matchCase: false}).click();
        cy.wait(500);
    });

    // Bilansside lisamine

    it("Kasutaja saab lisada bilansse", () => {
        cy.get(".btn-primary").contains("Bilanss", { matchCase: false }).click();
        cy.wait(1000);
        cy.contains("Bilanss");
        cy.get("#balanceModal > div > div > div.modal-body > button").click();
        cy.contains("Kuupäev").parent('tr').within(() => {
            cy.get('td').eq(0).type("2019-01-01");
            cy.get('td').eq(1).type("2020-01-01");
            cy.get('td').eq(2).type("2021-01-01")
        });
        cy.get(".modal-footer").contains("Salvesta", { matchCase: false}).click();
        cy.waitUntil(() => cy.contains("Bilansi andmed on salvestatud"));
        cy.get("#balanceModal > div > div > div.modal-footer > button.btn.btn-secondary").click();
        cy.wait(500);
    });

    // Tasuvuspunktide lisamine

    it("Kasutaja saab lisada tasuvuspunkte", () => {
        cy.get(".btn-primary").contains("Tasuvuspunkt", { matchCase: false }).click();
        cy.wait(1000);
        cy.contains("Tasuvuspunkti graafiku andmed");
        cy.get(".addRow").contains("Lisa rida", { matchCase: false}).click();
        cy.get(".modal-footer").contains("Salvesta", { matchCase: false}).click();
        cy.waitUntil(() => cy.contains("Tasuvuspunkti andmed on salvestatud"));
        cy.get("#breakEvenModal > div > div > div.modal-footer > button.btn.btn-secondary").click();
    });
});