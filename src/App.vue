<template>
    <div id="app">
        <div class="container">
            <div class="row">
                <BuilderList></BuilderList>
                <BuilderDetails></BuilderDetails>
            </div>
        </div>
    </div>
</template>

<script>
    import BuilderList from './components/Builders/BuilderList.vue';
    import BuilderDetails from './components/Builders/BuilderDetails.vue';

    export default {
        name: 'app',
        components: {
            BuilderList,
            BuilderDetails
        },
        data() {
            return {};
        }
    };
</script>

<style lang="scss">
    @import '~daemonite-material/assets/scss/material.scss';
    // Material icons
    @import "~material-design-icons-iconfont-only/iconfont/material-icons.css";

    body {
        //noinspection CssOptimizeSimilarProperties
        background-color: $material-color-teal-050;
        //noinspection CssOptimizeSimilarProperties
        background-image: url("./assets/bg.jpg");
        //noinspection CssOptimizeSimilarProperties
        background-attachment: fixed;
        background-size: 100vw 100vh;
        margin: 0 0 60px 0;
    }

    #app {
        margin: 15vh 0 0;
    }


    .footer {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 60px; /* Set the fixed height of the footer here */
        line-height: 60px; /* Vertically center the text there */
        color: white;
        font-size: 10px;
        font-weight: bold;
        text-align: center;
        ul {
            margin: 0;
        }
    }
</style>
