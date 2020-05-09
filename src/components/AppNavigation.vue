<template>
    <v-bottom-navigation v-model="bottomNav" dark fixed height="56px">
        <v-btn v-model="btnNavbar" v-for="item in items" :key="item.id" height="56px">
            <v-icon>{{item.icon}}</v-icon>
        </v-btn>
    </v-bottom-navigation>
</template>

<script>

	export default {
		data () {
			return {
				bottomNav: 5,
				btnNavbar : null,
                items: [
                    {title: 'page-1', icon : '1'},
                    {title: 'page-2', icon : '2'},
                    {title: 'page-3', icon : '3'},
                    {title: 'page-4', icon : 'mdi-phone'},
                    {title: 'page-5', icon : 'mdi-download'},
                ]
			}
		},
	}
</script>
