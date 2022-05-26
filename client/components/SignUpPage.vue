<template>
    <div>
        <sign-up @sign-up="subscribeNew($event)"></sign-up>
    </div>
</template>

<script>
const SignUp = window.httpVueLoader('./components/SignUp.vue');

module.exports = {
    name: "SignUpPage",

    components: {
        'sign-up': SignUp
    },

    methods: {
        subscribeNew(account) {
            this.$root.subscribe(account)
        }
    }
}
</script>