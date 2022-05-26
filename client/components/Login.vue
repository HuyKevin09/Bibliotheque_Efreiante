<template>
    <div>
        <form @submit.prevent="logIn">
            <h2>Entrez vos identifiants :</h2>

            <label for="email">Mon adresse mail :</label>
            <br>
            <input type="email" id="email" v-model="email" placeholder="E-mail *" value="admin1@gmail.com" required>

            <br>

            <label for="password">Mon mot de passe :</label>
            <br>
            <input type="password" id="password" v-model="password" placeholder="Mot de passe *" value="qwerty" required>

            <br>

            <button id="login" type="submit" @mouseover="changeColor" @mouseout="normalColor">SE CONNECTER</button>

            <div>
                <router-link id="createAccount" to="/SignUpPage">Créer un compte</router-link>
            </div>
        </form>
    </div>
</template>

<script>
module.exports = {
    name: "Login",

    data() {
        return {
            email: '',
            password: ''
        }
    },

    methods: {
        logIn() {
            this.$emit('login', {email: this.email, password: this.password});
        },

        normalColor() {
            document.getElementById("login").style.backgroundColor = "darkgrey";
        },

        changeColor() {
            document.getElementById("login").style.backgroundColor = "lightgrey";
        }
    }
  }
</script>

<style scoped>
    div {
        display: flex;
        justify-content: center;
    }

    form {
        border: solid;
        width: 30%;
        height: auto;
        text-align: left;
        padding: 3%;
    }

    h2 {
        text-align: center;
        font-family: Arial, sans-serif;
    }

    label {
        font-family: Arial,sans-serif;
        margin-left: 18%;
    }

    input {
        font-family: Arial,sans-serif;
        width: 63%;
        margin-top: 5px;
        margin-bottom: 20px;
        margin-left: 18%;
        border-left: 0;
        border-top: 0;
        border-right: 0;
        flex: auto;
    }

    #login {
        font-family: Arial, sans-serif;
        font-weight: lighter;
        font-size: 20px;
        width: 63%;
        margin-bottom: 10px;
        margin-left: 18%;
        border-radius: 0;
        border: 0;
        background-color: darkgrey;
    }

    #createAccount {
        font-family: Arial, sans-serif;
        color: black;
        text-align: center;
        text-decoration: underline;
        background-color: unset;
        border: unset;
        margin-top: 10px;
        margin-bottom: 20px;
    }
</style>