# This is Valex!

 This is a back-end app built to simulate "benefits cards" businesses.

While having companies and their employees registered to the database, you can manage their benefits cards, like "restaurant" type of cards, "transportation" cards, etc.

To run this project, while having NPM installed in your computer, run 'npm i' after cloning this repo.

### List of routes that you can use to try out, most of them are self-explanatory:

* POST:("/create-card") -- Expects a x-api-key header from a company, alongside a body: type, employeeId;
* POST:("/activate-card") -- Expects a body with the format, using your card's data: securityCode, number, expirationDate, cardholderName;
* POST:("/block-card") -- Expects a body with the format, using your card's data: password, id;
* POST:("/unblock-card") -- Expects a body with the format, using your card's data: password, id;
* POST:("/balance") -- to check card balance. Expects a body with the format: cardId;
* POST:("/payment") -- to use with POS (Points Of Sale). Expects a body with the format: cardId, password, businessId, amount;
* POST:("/recharge") -- when companies need to recharge their employees cards. Expects a x-api-key header from a company, alongside a body: cardId, amount;

Any errors found will be sent both in console as well as through the request response, so if anything's missing you can check there too!

