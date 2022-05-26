<template>
    <div>
        <nav>
            <router-link class="route" to='/basket' v-if="!$route.params.isAdmin">Panier</router-link>
            <router-link class="route" to='/'>Se déconnecter</router-link>
        </nav>

        <table>
            <caption>
                Bienvenue dans la bibliothèque officielle d'EFREI !
                <br>
                Pour emprunter un livre, veuillez indiquer le nombre d'exemplaires que vous voulez réserver.
            </caption>
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
            <tr v-for="book in books" :key="book.isbn + 'offset'">
                <td v-if="editingBook.isbn !== book.isbn" class="article-img">
                    <div :style="{ backgroundImage: 'url(' + book.image + ')' }"></div>
                </td>
                <td v-else class="article-img">
                    <div :style="{ backgroundImage: 'url(' + book.image + ')' }"></div>
                    <input type="text" v-model="editingBook.image">
                </td>
                <td v-if="editingBook.isbn !== book.isbn">{{book.title}}</td>
                <td v-else><input type="text" v-model="editingBook.title"></td>
                <td v-if="editingBook.isbn !== book.isbn">{{book.description}}</td>
                <td v-else><input type="text" v-model="editingBook.description"></td>
                <td v-if="editingBook.isbn !== book.isbn">{{book.authors}}</td>
                <td v-else><input type="text" v-model="editingBook.authors"></td>
                <td>{{book.isbn}}</td>
                <td v-if="editingBook.isbn !== book.isbn">{{book.quantity}}</td>
                <td v-else><input type="number" v-model="editingBook.quantity" placeholder="Quantité" required value="book.quantity"></td>
                <td v-if="$route.params.isAdmin && editingBook.isbn !== book.isbn">
                    <button @click="editBook(book)">Modifier</button>
                    <button @click="deleteBook(book.isbn)">Supprimer</button>
                </td>
                <td v-else-if="$route.params.isAdmin && !(editingBook.isbn !== book.isbn)">
                    <button @click="sendEditBook()">Valider</button>
                    <button @click="abortEditBook()">Annuler</button>
                </td>
                <td v-else><input class="qty" type="number" v-model="book.quantityBasket" placeholder="Quantité" required value="book.quantity">
                    <button id="add1" v-if="book.quantityBasket <= book.quantity && book.quantityBasket > 0" @click="addToBasket(book)">Valider</button>
                </td>
            </tr>
        </table>

        <!-- appel du composant AddBook --> 
        <add-book @add-book="addBookNew($event)"></add-book>

        <br>

        <!-- appel du composant Recherche -->
        <search-book @search-book="searchBookNew($event)" event-name='search-book'></search-book>

        <!--on parcourt la liste searched_books qui correspond à notre recherche -->
        <table v-if="searched_books.length !== 0">
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
            <tr v-for="book in searched_books" :key="book.isbn + 'offset2'">
                <td v-if="editingBook.isbn !== book.isbn" class="article-img">
                    <div :style="{ backgroundImage: 'url(' + book.image + ')' }"></div>
                </td>
                <td v-else class="article-img">
                    <div :style="{ backgroundImage: 'url(' + book.image + ')' }"></div>
                    <input type="text" v-model="editingBook.image">
                </td>
                <td v-if="editingBook.isbn !== book.isbn">{{book.title}}</td>
                <td v-else><input type="text" v-model="editingBook.title"></td>
                <td v-if="editingBook.isbn !== book.isbn">{{book.description}}</td>
                <td v-else><input type="text" v-model="editingBook.description"></td>
                <td v-if="editingBook.isbn !== book.isbn">{{book.authors}}</td>
                <td v-else><input type="text" v-model="editingBook.authors"></td>
                <td>{{book.isbn}}</td>
                <td v-if="editingBook.isbn !== book.isbn">{{book.quantity}}</td>
                <td v-else><input type="number" v-model="editingBook.quantity" placeholder="Quantité" required value="book.quantity"></td>
                <td v-if="$route.params.isAdmin && editingBook.isbn !== book.isbn">
                    <button @click="editBook(book)">Modifier</button>
                    <button @click="deleteBook(book.isbn)">Supprimer</button>
                </td>
                <td v-else-if="$route.params.isAdmin && !(editingBook.isbn !== book.isbn)">
                    <button @click="sendEditBook()">Valider</button>
                    <button @click="abortEditBook()">Annuler</button>
                </td>
                <td v-else>
                    <input class="qty" type="number" v-model="book.quantityBasket" placeholder="Quantité" required value="book.quantity}}">
                    <button id="add2" v-if="book.quantityBasket <= book.quantity && book.quantityBasket > 0" @click="addToBasket(book)">Valider</button>
                </td>
            </tr>
        </table>

    </div>
</template>


<script>
//importation du composant AddBook
const AddBook = window.httpVueLoader('./components/AddBook.vue');
const SearchBook = window.httpVueLoader('./components/SearchBook.vue');

module.exports = {
    name : 'Home',

    props: {
        books: { type: Array,
            default() {
                return []
            }
        },
        searched_books: { type: Array,
            default() {
                return []
            }
        }
    },

    components: {
        'add-book' : AddBook, // composant formulaire d'ajout
        'search-book' : SearchBook // barre de rechercher commune 
    },

    data () {
        return {      
            editingBook: {
                isbn: '',
                title: '',
                description: '',
                authors: '',
                image: '',
            },
            quantityBasket : 0
        }
    },

    async mounted() {
      this.$emit('display-catalog');
    },

    methods: {
        addBookNew (newBook) {
            this.$root.addBook(newBook); //depuis root (défini dans vue-appli) on appelle la méthode addBook
        },

        editBook (newBook) {
            this.editingBook.isbn = newBook.isbn;
            this.editingBook.title = newBook.title;
            this.editingBook.description = newBook.description;
            this.editingBook.authors = newBook.authors;
            this.editingBook.image = newBook.image;
        },
        
        sendEditBook () {
            this.$emit('update-book', this.editingBook);
            this.abortEditBook();
        },

        abortEditBook () {
            this.editingBook = {
                isbn: '',
                title: '',
                description: '',
                authors: '',
                image: ''
            }
        },

        searchBookNew (searchedBookTitle) {
            this.$root.searchBook(searchedBookTitle);
        },        

        deleteBook (isbn) {
            this.$emit('delete-book', isbn);
        },

        addToBasket(bookAndQuantityBook){ 
            this.$emit('add-to-basket', bookAndQuantityBook);
            bookAndQuantityBook.quantityBasket = '';
        }
    }
}
</script>

<style scoped>
    article {
        display: flex;
        align-items: center;
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

    .qty {
        height: 15%;
        border-radius: 100px;
        border: 1px solid;
        margin-bottom: 5px;
    }
</style>
