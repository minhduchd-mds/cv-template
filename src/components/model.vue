<template>
    <v-card tile  v-if="modelPhone">
        <v-progress-linear
                :value="50"
                class="my-0"
                height="3"
        ></v-progress-linear>

        <v-list>
            <v-list-item>
                <v-list-item-content>
                    <v-list-item-title>The Walker</v-list-item-title>
                    <v-list-item-subtitle>Fitz & The Trantrums</v-list-item-subtitle>
                </v-list-item-content>

                <v-spacer></v-spacer>

                <v-list-item-icon>
                    <v-btn icon>
                        <v-icon>mdi-rewind</v-icon>
                    </v-btn>
                </v-list-item-icon>

                <v-list-item-icon :class="{ 'mx-5': $vuetify.breakpoint.mdAndUp }">
                    <v-btn icon>
                        <v-icon>mdi-pause</v-icon>
                    </v-btn>
                </v-list-item-icon>

                <v-list-item-icon
                        class="ml-0"
                        :class="{ 'mr-3': $vuetify.breakpoint.mdAndUp }"
                >
                    <v-btn icon>
                        <v-icon>mdi-fast-forward</v-icon>
                    </v-btn>
                </v-list-item-icon>
            </v-list-item>
        </v-list>
    </v-card>
</template>

<script>
	export default {
		name: "model"
	}
</script>

<style scoped>

</style>