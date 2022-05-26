<template>
    <div>
        <h2>Rechercher un livre</h2>
        <form @submit.prevent="searchBook">
            <input type="text" v-model="searchedBookTitle" placeholder="Recherche un livre" required>
            <button type="submit">Rechercher</button>
        </form>
    </div>
</template>

<script>
    module.exports = {
        name : 'SearchBook',

        props: {  
            eventName: {type: String}
        },

        data () {
            return {
                searchedBookTitle: ''
            }
        },

        methods: {
            searchBook () {
                this.$emit(this.eventName, {searchedBookTitle: this.searchedBookTitle});
            }, 
        }
    }
</script>

<style scoped>
    h2 {
        margin-bottom: 2%;
        font-family: Arial, sans-serif;
        font-size: 20px;
        font-weight: bold;
        text-align: center;
    }

    form {
        display: flex;
        justify-content: center;
        font-family: Arial, sans-serif;
    }

    input {
        margin-right: 4% ;
    }
</style>