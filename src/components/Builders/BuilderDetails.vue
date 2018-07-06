<template>

    <div class="builderContainer col-12 col-md-9">
        <div class="card" v-show="currentBuilder === null">
            <div class="card-header text-center">
                Please select a builder
            </div>
        </div>

        <div class="card builderDetails" v-if="currentBuilder !== null">
            <div class="card-header">
                <span class="chip" title="Builder ID">{{currentBuilderId}}</span>
                <span class="chip" title="Builder's working directory">{{currentBuilder.path}}</span>
                <span class="chip" title="Builder's command and args">{{currentBuilder.command}} {{currentBuilder.args.join(' ')}}</span>
                <div class="custom-control custom-switch float-right" title="Toggle builder">
                    <input class="custom-control-input" v-bind:id="`builderSwitch${currentBuilderId}`" type="checkbox" v-bind:checked="currentBuilder.active" @click="toggleBuilder">
                    <span class="custom-control-track"></span>
                    <label class="custom-control-label" v-bind:for="`builderSwitch${currentBuilderId}`"></label>
                </div>
            </div>
            <BuilderLog v-bind:builder_id="currentBuilderId" v-bind:messages="messages" :key="currentBuilderId"></BuilderLog>
        </div>

    </div>
</template>

<script>
    import BuilderLog from './BuilderLog.vue';

    export default {
        name: 'BuilderDetails',
        components: {
            BuilderLog
        },
        data() {
            return {
                currentBuilder: null,
                currentBuilderId: null,
                messages: [],
            };
        },
        sockets: {
            /**
             *
             * @param data
             */
            'builder-details': function (data) {
                this.currentBuilder = data.builder;
                this.currentBuilderId = data.builder_id;
                this.$socket.emit('attach-log', {builder_id: this.currentBuilderId});
            },

            /**
             *
             */
            'builder-activated': function () {
                this.currentBuilder.active = true;
            },

            /**
             *
             */
            'builder-deactivated': function () {
                this.currentBuilder.active = false;
            },

            /**
             *
             * @param data
             */
            'builder-log-line': function (data) {
                this.messages.push(data.logLine);
            },
        },
        
        methods: {

            /**
             *
             * @param e
             */
            toggleBuilder: function (e) {
                e.preventDefault();
                if (e.target.checked) {
                    this.$socket.emit('activate-builder', {builder_id: this.currentBuilderId});
                } else {
                    this.$socket.emit('deactivate-builder', {builder_id: this.currentBuilderId});
                }
            }
        },
    };
</script>

<style scoped lang="scss">
    .builderContainer {

        .builderDetails {
            .chip {
                margin: 0 10px 0 0;
            }
            .custom-switch {
                position: relative;
                left: 15px;
                top: 7px;
            }
        }
    }
</style>
