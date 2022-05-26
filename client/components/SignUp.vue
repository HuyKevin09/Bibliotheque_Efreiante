<template>
    <div>
        <form method="post" @submit.prevent="subscribe">
            <h2>Complétez avec vos coordonnées pour créer un compte. Tous les champs sont obligatoires.</h2>

            <label for="email">Mon adresse mail :</label>
            <br>
            <input type="email" id="email" v-model="email" placeholder="E-mail *" required>

            <br>

            <label for="password">Mon nouveau mot de passe :</label>
            <br>
            <input type="password" id="password" v-model="password" placeholder="Mot de passe *" required>

            <br>

            <label for="password">Confirmer mon mot de passe :</label>
            <br>
            <input type="password" v-model="confirmPassword" placeholder="Mot de passe *" required>

            <div>
              <button id="sub" type="submit" @mouseover="changeColor" @mouseout="normalColor">S'INSCRIRE</button>
            </div>
        </form>
    </div>
</template>

<script>
module.exports = {
    name: "signUp",

    data() {
        return {
            email: '',
            password: '',
            confirmPassword: ''
        }
    },

    methods: {
        subscribe() {
            this.$emit('sign-up', {email: this.email, password: this.password, confirmPassword: this.confirmPassword});
            this.$router.push('/');
        },

        normalColor() {
            document.getElementById("sub").style.backgroundColor = "darkgrey";
        },

        changeColor() {
            document.getElementById("sub").style.backgroundColor = "lightgrey";
        }
    }
}
</script>

<style scoped>
    div {
        display: flex;
        justify-content: center;
        margin: 3%;
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

    #sub {
        font-family: Arial, sans-serif;
        font-weight: lighter;
        font-size: 20px;
        width: 63%;
        margin-bottom: 10px;
        border-radius: 0;
        border: 0;
        background-color: darkgrey;
    }
</style>