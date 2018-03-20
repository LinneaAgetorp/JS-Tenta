// JavaScript för att implementera kraven A-E.

// Get products from database:
fetch('https://demo.edument.se/api/products')
    .then(response => response.json()) //hämta produkter, i json-format
    .then(products => {
        appState.productCatalogue = products; //lägg till produkter i produktkatalogen
        productPage.render();
    })
    .catch(err => console.log(err));

let $checkoutWrapper = $('.checkout-wrapper');
let $productWrapper = $('.product-wrapper');

const initializePage = () => {
    let $checkoutBtn = $("#checkoutBtn");
    let $productBtn = $("#productBtn");
    let $submitBtn = $("#submitBtn"); //submit order-button

//Switches between "product view" and "checkout view"
    $checkoutWrapper.hide();
    $submitBtn.hide();

    $productBtn.click(() => {
        $checkoutWrapper.hide();
        $productWrapper.show();
    });

    $checkoutBtn.click(() => {
        $productWrapper.hide();
        $checkoutWrapper.show();
        $submitBtn.show();
        checkoutFunctions.renderCheckout();
    });

    //Submit order btn
    $submitBtn.click((e) => {
        e.preventDefault();
        checkoutFunctions.createOrder();
    });
};


//this is where shopping cart and products are "saved"
const appState = {
    cart: {
        cart_rows: [],
    },
    productCatalogue: [],
};


const productPage = {
    decreaseAmount: function (productId, amountInStock) {
        appState.productCatalogue.findIndex((element) => {
            if (productId === element.Id) {

                if (amountInStock < 0) {
                    $(`#addBtn-${productId}`).attr('disabled', 'disabled');
                }
                else {
                    $(`#counter-${productId}`).text(`Available: ` + amountInStock);
                }

            }
        });
    },

    render: () => {

        let $productWrapper = $(".product-wrapper");


        appState.productCatalogue.map((product) => {
            let amountInStock = Math.floor((Math.random() * 10) + 1);
            $productWrapper.append(
                `<div class="product"> 
                <h2>${product.Name}</h2>
                <p>Price: ${product.Price} kr</p>
                <img src=${product.Image}>
                <p id="counter-${product.Id}">Available: ${amountInStock}</p>
                <button id="addBtn-${product.Id}">Add to Cart</button>
            </div> 
            `);

            $(`#addBtn-${product.Id}`).click(() => {
                amountInStock--;
                productPage.decreaseAmount(product.Id, amountInStock);
                cartFunctions.addProduct(product.Id);
            });


        });
    }
};

const checkoutFunctions = {
    renderCheckout: () => {

        let totalAmount = 0;
        const theCheckoutContainerElement = $('#checkoutCart');
        theCheckoutContainerElement.empty();


        appState.cart.cart_rows.map((row) => {
            const product = appState.productCatalogue.find((e) => e.Id === row.productId);
            const htmlRow = $("<div class='checkout-row'>"); //this is parent-div
            let rowSum = (product.Price * row.count);
            totalAmount += rowSum; //adds up every rowSum into totalAmount


            htmlRow.append(`
            
            <h3>Product: ${product.Name}</h3>
            <div id="cartItems">
                <span>Nr of this product: ${row.count}</span>
            </div>
            <span>Price per product: ${product.Price} kr</span>
            <span>This row total: ${rowSum} kr</span>
            `);


            theCheckoutContainerElement.append(htmlRow); //makes current html-element a child of checkoutCart


        });

        theCheckoutContainerElement.append(
            `
            <h2>Total amount: ${totalAmount} kr</h2>
      `);

    },
    submitOrder: (orders) => {
        const promises = [];
        for (let i in orders) {
            const order = orders[i];
            console.log(order);
            const promise = fetch('http://localhost:3000/orders',
                {
                    method: 'POST',
                    body: JSON.stringify(order),
                    headers: new Headers({'Content-Type': 'application/json'})
                });

            promises.push(promise);

        }
        Promise.all(promises)
            .then(() => {

                alert('Success! You have placed your order! '); //newOrder

                const theCheckoutContainerElement = $('#checkoutCart');
                theCheckoutContainerElement.empty();
                //empty shopping cart
                appState.cart.cart_rows = [];

                //go back to product-view
                $checkoutWrapper.hide();
                $productWrapper.show();
            });
    },

    createOrder: () => {
        let products = appState.cart.cart_rows.map((row) =>
            appState.cart.cart_rows.find((product) => row.productId === product.productId)
        );


        checkoutFunctions
            .submitOrder(products)
    },


};

const cartFunctions = {
    addProduct: (productId) => { //which productId depends on which button you clicked
        const indexOfCartRow = appState.cart.cart_rows.findIndex((e) => (e.productId === productId));
        if (indexOfCartRow === -1) { //if the productId you clicked does not exist in cart, a new row is added
            appState.cart.cart_rows.push({productId: productId, count: 1}) //with cart_rows.count set to 1
        } else {
            appState.cart.cart_rows[indexOfCartRow].count++;// else, increase cart_rows.count by 1 on the found element
        }
    },

};

initializePage();