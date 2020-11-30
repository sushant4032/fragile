const app = Vue.createApp({
    data() {
        return {
            courseGoal: 'Finish the  course',
            vueLink: 'https://vuejs.org',
            myNumber: Math.round(100 * Math.random())
        }
    },
    methods: {
        myRandom() {
            return this.myNumber;
        }
    }
});
app.mount('#user-goal');