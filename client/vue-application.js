const LoginPage = window.httpVueLoader('./components/LoginPage.vue')
const SignUpPage = window.httpVueLoader('./components/SignUpPage.vue')
const Home = window.httpVueLoader('./components/Home.vue')
const Basket = window.httpVueLoader('./components/Basket.vue')

const routes = [
    { path: '/', component: LoginPage },
    { path: '/signUpPage', component: SignUpPage },
    { path: '/home', name : 'home', component: Home },
    { path: '/basket', component: Basket },
]

const router = new VueRouter({
    routes
})

let app = new Vue({
    router,

    el: '#app',

    data: {
        books: [],
        searched_books: [],
        basket: [],
        searched_books_basket: []
    },

    methods: {
        async subscribe(account) {
            const res = await axios.post('/api/signUp', account)
            alert(res.data)
        },

        async logIn(account) {
            const res = await axios.get('/api/login', {
                params: {
                    email: account.email,
                    password: account.password
                }
            })
            if (res.data.provisoire) {
                // console.log(res.data)
                sessionStorage.setItem('id_user', res.data.id_user);
                sessionStorage.setItem('isAdmin', res.data.isAdmin);
                this.$router.push({name: 'home', params: {'isAdmin': res.data.isAdmin}}); // redirection vers le composant Home
            } else {
                alert("Oops, e-mail ou mot de passe incorrect :/"); // aucune redirection mais affichage d'un message d'erreur
            }
            this.basket = [];
            this.searched_books = [];
        },

        async addBook(book) {
            const res = await axios.post('/api/home/book', book) // retourne le livre ajouté avec la nouvelle quantité
            this.books = res.data
        },

        async updateBook(newBook) {
            console.log('update book')
            await axios.put('/api/home/book/:isbn', newBook)
            const currentBook = this.books.find(a => a.isbn === newBook.isbn)
            currentBook.title = newBook.title
            currentBook.description = newBook.description
            currentBook.authors = newBook.authors
            currentBook.image = newBook.image
            currentBook.quantity = newBook.quantity
        },

        async searchBook(bookTitle) {
            const isAdmin = sessionStorage.getItem('isAdmin');
            const res = await axios.get('/api/home/book', {
                params: {
                    isAdmin: isAdmin,
                    searchedBookTitle: bookTitle.searchedBookTitle,
                }
            })
            this.searched_books = res.data
        },

        async searchBookInBasket(bookTitle) {
            const id_user = sessionStorage.getItem('id_user');
            const res = await axios.get('/api/home/basket/book', {
                params: {
                    id_user: id_user,
                    searchedBookTitle: bookTitle.searchedBookTitle,
                }
            })
            this.searched_books_basket = res.data // affichage des livres suite à la recherche
        },


        async deleteBook(isbn, location) {
            // delete de basket
            const isAdmin = sessionStorage.getItem('isAdmin');
            if (location !== undefined && location[0] === 'basket') {
                axios.delete("api/home/basket", {
                    params: {
                        id_user: sessionStorage.getItem('id_user'),
                        isbn: isbn,
                        quantity_delete: location[1]
                    }
                }).then(() => this.$root.displayBasket())
            }
            // delete de catalogue
            else {
                axios.delete("api/home/book", {
                    params: {
                        isAdmin: isAdmin,
                        isbn: isbn
                    }
                }).then(res => this.books = res.data)
            }
        },

        async addBookToBasket(bookAndQuantityBook) {
            const userId = sessionStorage.getItem('id_user');
            const res = await axios.post("/api/home/basket/book/" + userId, bookAndQuantityBook);
            this.basket = res.data[0];
            alert("Livre ajouté au panier ! :D");
        },

        async confirmBasketValidation() {
            const userId = sessionStorage.getItem('id_user');
            let res = await axios.delete('/api/home/basket/' + userId)
            // vider le panier (retirer les livres de l'affichage du panier)
            if (res.data === "") { // les livres sont disponibles
                alert("Votre emprunt a été validé !")
                this.basket = [];
                this.searched_books_basket = [];
            } else { // au moins un livre du panier n'est pas disponible
                alert("Oops, les quantités des livres suivants ne sont pas disponibles : \n" + res.data)
            }
            
        },

        // affiche tous les livres du panier
        async displayBasket() {
            const userId = sessionStorage.getItem('id_user');
            const res = await axios.get("/api/home/basket/" + userId)
            if (res.data[0] === "not_empty") { // s'il y a quelque chose dans le panier
                this.basket = res.data[1]
            }
            // s'il n'y a aucun livre
            if (res.data[0] === "empty") {
                this.basket = res.data[1]
            }
        },

        async displayCatalog() {
            // affiche tous les livres contenus dans la table Book
            const isAdmin = sessionStorage.getItem('isAdmin');
            const res = await axios.get('/api/home/books/' + isAdmin);
            this.books = res.data;
        },
    }
});
