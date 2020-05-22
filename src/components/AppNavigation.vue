<template>
    <v-bottom-navigation v-model="bottomNav"  fixed height="56px" >

        <v-btn v-model="btnNavbar" v-for="item in items" :key="item.id" height="56px">
            <v-icon>{{item.icon}}</v-icon>
        </v-btn>
        <v-btn @click="sheet = !sheet" height="56px">
            <v-icon>mdi-phone</v-icon>
        </v-btn>
        <v-card class="model" v-if="sheet">
            <v-progress-linear
                    :value="50"
                    class="my-0"
                    height="3"
            ></v-progress-linear>
           <div class="model-body">
               <div class="">
                   <a class="download-pdf-click" download href="../../public/Do-Minh-Duc.pdf">CV PDF</a>
               </div>
               <v-btn left @click="sheet = !sheet"><v-icon>mdi-close</v-icon></v-btn>
           </div>
        </v-card>
    </v-bottom-navigation>

</template>

<script>

	export default {

		data () {
			return {
				bottomNav: 1,
				btnNavbar : null,
				sheet : false,
                items: [
                    {title: 'page-1', icon : '1'},
                    {title: 'page-2', icon : '2'},
                    {title: 'page-3', icon : '3'},
                    {title: 'page-5', icon : 'mdi-download'},
                ],
			}
		},

	}
</script>
<style scoped>
    .model{
        transform-origin: center center;
        width: 100%;
        position: fixed;
        bottom: 0;
        height: 448px;
        border-radius: 4px;
        overflow-y: auto;
        pointer-events: auto;
        transition: .3s cubic-bezier(.25,.8,.25,1);
        z-index: inherit;
        box-shadow: 0 11px 15px -7px rgba(0,0,0,.2), 0 24px 38px 3px rgba(0,0,0,.14), 0 9px 46px 8px rgba(0,0,0,.12);
    }
    .model-body{
        padding: 24px;
    }
    .model-body button {position: absolute !important; right: 0;}
</style>
