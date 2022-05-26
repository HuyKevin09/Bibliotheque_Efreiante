<!-- formulaire pour ajouter un livre par un administrateur -->
<template>
    <div v-if="$route.params.isAdmin">
        <h2>Nouveau livre à ajouter</h2>
        <form @submit.prevent="addBook"> 
            <input type="text" v-model="newBook.image" placeholder="Lien vers l'image du livre" required>
            <input type="text" v-model="newBook.title" placeholder="Titre du livre" required>
            <input type="text" v-model="newBook.description" placeholder="Description du livre" required>
            <input type="text" v-model="newBook.authors" placeholder="Auteur(s)" required>
            <input type="text" v-model="newBook.isbn" placeholder="ISBN" required>
            <input type="number" v-model="newBook.quantity" placeholder="Quantité" required>
            <button type="submit">Ajouter</button>
        </form>
    </div>
</template>

<script>
    module.exports = {
        data () {
            return {
                newBook: {
                    isbn: '',
                    title: '',
                    description: '',
                    authors: '',
                    image: '',
                    quantity: 0
                },
            }
        },

        methods: {
            addBook () {
                //envoi d'un événement à Home pour ajouter un livre
                this.$emit('add-book', this.newBook);
                this.newBook.isbn = '';
                this.newBook.title = '';
                this.newBook.description = '';
                this.newBook.authors = '';
                this.newBook.image = '';
                this.newBook.quantity = 0;
            }
        }
    }
</script>

<style scoped>
    article {
        display: flex;
    }

    .article-img div {
        width: 100px;
        height: 100px;
        background-size: cover;
    }

    textarea {
        width: 100%;
    }

    h2 {
        margin-bottom: 3%;
        font-family: Arial, sans-serif;
        font-size: 20px;
        font-weight: bold;
        text-align: center;
    }

    form {
        display: flex;
        justify-content: space-evenly;
        font-family: Arial, sans-serif;
    }
</style>