<template>
    <div>
        <login @login="logInUser($event)"></login>
    </div>
</template>

<script>
const Login = window.httpVueLoader('./components/Login.vue')

module.exports = {
    name: "LoginPage",

    components: {
        'login' : Login //appel du composant
    },

    methods: {
        logInUser(account) {
            this.$root.logIn(account)
        }
    }
}
</script>