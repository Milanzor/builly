<template>
    <div class="builderLog" v-if="messages.length > 0">
        <p v-for="message in messages" v-bind:key="message">{{message}}</p>
    </div>
</template>

<script>

    export default {
        name: 'BuilderLog',
        props: ['builder_id', 'messages'],
        methods: {},
        mounted() {
            console.log(this.builder_id);
        }
    };
</script>

<style scoped lang="scss">
    .builderLog {
        width: 100%;
        background: black;
        padding: 25px;
        border-radius: 2px;
        margin: 25px 0 0 0;
        color: white;
        font-family: monospace;
        font-size: 13px;
        white-space: pre-wrap;
        height: 500px;
        overflow-y: scroll;
        p {
            white-space: pre-wrap;
            margin: 0;
        }
    }
</style>
