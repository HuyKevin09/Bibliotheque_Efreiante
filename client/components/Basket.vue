<template>
    <div>
        <nav>
            <router-link class="route" to='/home'>Catalogue</router-link>
            <router-link class="route" to='/'>Se déconnecter</router-link>
        </nav>

        <div v-if="basket.length !== 0">
            <table>
                <caption>
                    Bienvenue dans votre panier ! 
                    <br>
                    Vous pouvez valider la sélection de vos livres en appuyant sur le bouton "réserver"
                </caption>
                <tr>
                    <th>IMAGE</th>
                    <th>TITRE</th>
                    <th>DESCRIPTION</th>
                    <th>AUTEUR</th>
                    <th>ISBN</th>
                    <th>QUANTITÉ RÉSERVÉE</th>
                    <th>SUPPRIMER</th>
                </tr>
                <tr v-for="book in basket" :key="book.isbn">
                    <td class="article-img">
                        <div :style="{ backgroundImage: 'url(' + book.image + ')' }"></div>
                    </td>
                    <td>{{book.title}}</td>
                    <td>{{book.description}}</td>
                    <td>{{book.authors}}</td>
                    <td>{{book.isbn}}</td>
                    <td>{{book.quantity}}</td>
                    <td>
                        <input type="number" v-model="book.quantityBasketDelete" placeholder="Quantité à enlever">
                        <button v-if="book.quantityBasketDelete <= book.quantity && book.quantityBasketDelete > 0" @click="deleteBook(book.isbn, book.quantityBasketDelete)">Supprimer</button>
                    </td>
                </tr>
            </table>
        </div>

        <!-- valider l'emprunt des livres -->
        <div id="reserve">
            <button id="btn" @click="confirmBasket()">Réserver</button>
        </div>

        <!-- appel du composant Recherche -->
        <search-book @search-book-basket="searchBookNewBasket($event)" event-name='search-book-basket'></search-book>
        
        <!--on parcourt la liste searched_books qui correspond à notre recherche -->
        <table v-if="searched_books_basket.length !== 0">
            <tr>
                <th>IMAGE</th>
                <th>TITRE</th>
                <th>DESCRIPTION</th>
                <th>AUTEUR</th>
                <th>ISBN</th>
                <th>QUANTITÉ DISPONIBLE</th>
                <th v-if="$route.params.isAdmin">MODIFIER/SUPPRIMER</th>
                <th v-else>AJOUTER AU PANIER</th>
            </tr>
            <tr v-for="book in searched_books_basket" :key="book.isbn + 'offset2'">
                <td class="article-img">
                    <div :style="{ backgroundImage: 'url(' + book.image + ')' }"></div>
                </td>
                <td>{{book.title}}</td>
                <td>{{book.description}}</td>
                <td>{{book.authors}}</td>
                <td>{{book.isbn}}</td>
                <td>{{book.quantity}}</td>
                <td>
                    <button @click="deleteBook(book.isbn)">Supprimer</button>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
const SearchBook = window.httpVueLoader('./components/SearchBook.vue')

module.exports = {
    props: {
        basket: { type: Array,
            default() {
                return []
            }
        },
        searched_books_basket: { type: Array,
            default() {
                return []
            }
        }
    },

    components: {
        'search-book' : SearchBook // barre de recherche commune
    },

    data () {
        return {
            quantityBasketDelete: 0
        }
    },

    async mounted () {
        this.$emit('display-basket');
    },

    methods: {
        searchBookNewBasket (searchedBookTitle) {
            // console.log(searchedBookTitle)
            this.$root.searchBookInBasket(searchedBookTitle);
        },

        deleteBook (isbn, quantityBasketDelete) {
            this.$emit('delete-book', isbn, ['basket', quantityBasketDelete]);
        },

        confirmBasket() {
            this.$emit('confirm-basket');
        }
    }
}
</script>

<style scoped>
    article {
        display: flex;
    }

    .article-img {
        flex: 1;
    }

    .article-img div {
        padding: 30px 40px;
        margin-top: 10px;

        width: 100px;
        height: 150px;
        background-size: cover;
    }

    #reserve{
        margin-top: 20px;
        display: flex;
        justify-content: center;
    }

    p{
        padding-top: 10px;
    }

    textarea {
        width: 100%;
    }

    nav {
        font-family: Arial, sans-serif;
        text-align: center;
        font-weight: bold;
        margin-top: 3%;
    }

    .route {
        color: black;
        margin-left: 5%;
        margin-right: 5%;
        font-size: 15px;
    }

    table {
        table-layout: fixed;
        width: 100%;
        margin-top: 3%;
        border-collapse: collapse;
    }

    table caption {
        margin-bottom: 3%;
        font-family: Arial, sans-serif;
        font-size: 20px;
        font-weight: bold;
    }
    tr {
        border-bottom: 1px solid;
        border-color: lightgray;
        padding-top: 5px;
    }
    td{
        text-align: center;
        font-family: Arial, sans-serif;
    }
    th {
        text-align: center;
        font-family: Arial, sans-serif;
        font-weight: bold;
        color: darkcyan;
    }
    #btn {
        font-weight: bold;
        font-size: 20px ;
    }
</style>
