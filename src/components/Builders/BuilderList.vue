<template>
    <div class="builderList col-12 col-md-3">
        <div
                v-for="(builder, builder_id) in builders"
                :key="`builder-${builder_id}`"

                @click="builderDetails(builder_id)"

                class="card mb-3 builder"
                v-bind:class="{opened: currentBuilderId === builder_id}"
        >
            <div class="card-header">
                {{builder_id}}
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'BuilderList',
        data() {
            return {
                builders: {},
                currentBuilderId: null
            };
        },
        sockets: {
            'builder-list': function (builders) {
                this.builders = builders;
            },
        },
        methods: {
            builderDetails: function (builder_id) {
                this.$socket.emit('get-builder-details', {builder_id: builder_id});
                this.currentBuilderId = builder_id;
            }
        },
    };
</script>

<style lang="scss">
    @import '~daemonite-material/assets/scss/material.scss';

    .builderList {
        .builder {
            cursor: pointer;
            &.opened {
                @extend .bg-primary;
                @extend .text-white;
            }
        }
    }
</style>
